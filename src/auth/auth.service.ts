import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usuariosService: UsuariosService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usuariosService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    // Extraer los permisos del rol
    const permisos = user.role?.permisos?.map((p: any) => p.nombre) || [];
    const payload = { 
      sub: user.id, 
      email: user.email, 
      rolId: user.roleId, 
      rol: user.role?.nombre,
      permisos
    };
    const accessToken = this.jwtService.sign(payload);
    // Generar refresh token (expira en 7 días)
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'refreshsecretkey');
    const expiresIn = 60 * 60 * 24 * 7; // 7 días en segundos
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn, secret: refreshSecret }
    );
    // Calcular fecha de expiración
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    // Guardar refresh token hasheado y expiración en la base de datos
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.usuarioRepository.update(user.id, { refreshToken: hashedRefresh, refreshTokenExpires: expiresAt });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.usuarioRepository.findOneBy({ id: userId });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    // Validar expiración
    if (!user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
      throw new UnauthorizedException('Refresh token expirado');
    }
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    // Extraer los permisos del rol
    const userWithRole = await this.usuariosService.findOne(userId);
    const permisos = userWithRole?.role?.permisos?.map((p: any) => p.nombre) || [];
    const payload = {
      sub: user.id,
      email: user.email,
      rolId: user.roleId,
      rol: userWithRole?.role?.nombre,
      permisos
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      access_token: accessToken,
    };
  }

  async logout(userId: number): Promise<void> {
    if (!userId) throw new Error('userId es requerido para logout');
    await this.usuariosService.update(userId, { refreshToken: null, refreshTokenExpires: null });
  }
}
