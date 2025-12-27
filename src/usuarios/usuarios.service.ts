import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  /**
   * Limpia los refresh tokens expirados de los usuarios.
   * Retorna la cantidad de usuarios afectados.
   */
  async cleanExpiredRefreshTokens(): Promise<number> {
    const now = new Date();
    const result = await this.usuarioRepository.createQueryBuilder()
      .update(Usuario)
      .set({ refreshToken: undefined, refreshTokenExpires: undefined })
      .where('refreshTokenExpires IS NOT NULL AND refreshTokenExpires < :now', { now })
      .execute();
    return result.affected || 0;
  }
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const existingUsuario = await this.usuarioRepository.findOneBy({ email: createUsuarioDto.email });
    if (existingUsuario) {
      const error: any = new Error('El correo electrónico ya está registrado');
      error.statusCode = 409;
      error.message = 'El correo electrónico ya está registrado por otro usuario.';
      throw error;
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, salt);
    // Relacionar el rol si viene roleId
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
      ...(createUsuarioDto.roleId ? { role: { id: createUsuarioDto.roleId } } : {}),
    });
    const savedUsuario = await this.usuarioRepository.save(usuario);
    const usuarioConRol = await this.usuarioRepository.findOne({
      where: { id: savedUsuario.id },
      relations: ['role'],
    });
    const { password, ...usuarioSinpassword } = usuarioConRol!;
    return usuarioSinpassword;
  }

  async findAll(query: { page?: number; limit?: number }): Promise<{ data: Omit<Usuario, 'password'>[]; total: number; page: number; lastPage: number }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.usuarioRepository.findAndCount({
      skip,
      take: limit,
      relations: ['role'],
    });

    const sanitizedData = data.map(({ password, ...usuarioSinpassword }) => usuarioSinpassword);

    return {
      data: sanitizedData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Omit<Usuario, 'password'> | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!usuario) {
      return null;
    }
    const { password, ...usuarioSinpassword } = usuario;
    return usuarioSinpassword;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Omit<Usuario, 'password'> | null> {
    const usuario = await this.usuarioRepository.findOne({ where: { id }, relations: ['role'] });
    if (!usuario) {
      return null; // Manejo del caso en que el usuario no exista
    }

    if (updateUsuarioDto.email) {
      const existingUsuario = await this.usuarioRepository.findOneBy({ email: updateUsuarioDto.email });
      if (existingUsuario && existingUsuario.id !== id) {
        const error: any = new Error('El correo electrónico ya está registrado');
        error.statusCode = 409;
        error.message = 'El correo electrónico ya está registrado por otro usuario.';
        throw error;
      }
    }

    if (updateUsuarioDto.password) {
      const salt = 10;
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, salt);
    }

    // Si viene roleId, actualiza la relación de rol
    let updateData = Object.fromEntries(
      Object.entries(updateUsuarioDto).filter(([_, v]) => v !== undefined)
    );

    if (updateUsuarioDto.roleId) {
      updateData = { ...updateData, role: { id: updateUsuarioDto.roleId } };
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    await this.usuarioRepository.update(id, updateData);
    const updatedUsuario = await this.usuarioRepository.findOne({ where: { id }, relations: ['role'] });
    if (!updatedUsuario) {
      return null;
    }
    const { password, ...usuarioSinpassword } = updatedUsuario;
    return usuarioSinpassword;
  }

  async remove(id: number): Promise<Omit<Usuario, 'password'> | null> {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      throw new Error('El usuario no existe');
    }
    await this.usuarioRepository.softRemove(usuario);
    const { password, ...usuarioSinpassword } = usuario;
    return usuarioSinpassword;
  }

  async findDeleted(query: { page?: number; limit?: number }): Promise<{ data: Omit<Usuario, 'password'>[]; total: number; page: number; lastPage: number }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.usuarioRepository.findAndCount({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) },
      skip,
      take: limit,
    });

    

    const sanitizedData = data.map(({ password, ...usuarioSinpassword }) => usuarioSinpassword);

    return {
      data: sanitizedData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async restore(id: number): Promise<Omit<Usuario, 'password'> | null> {
    const usuario = await this.usuarioRepository.findOne({ where: { id }, withDeleted: true });
    if (!usuario) {
      throw new Error('El usuario no existe o no está eliminado');
    }
    await this.usuarioRepository.recover(usuario);
    const { password, ...usuarioSinpassword } = usuario;
    return usuarioSinpassword;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({
      where: { email },
      relations: ['role', 'role.permisos'],
    });
  }
}
