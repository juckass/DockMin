import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const existingUsuario = await this.usuarioRepository.findOneBy({ correo: createUsuarioDto.correo });
    if (existingUsuario) {
      throw new Error('El correo ya está registrado');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, salt);
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
    });
    const savedUsuario = await this.usuarioRepository.save(usuario);
    const { password, ...usuarioSinpassword } = savedUsuario;
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
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      return null; // Manejo del caso en que el usuario no exista
    }

    if (updateUsuarioDto.correo) {
      const existingUsuario = await this.usuarioRepository.findOneBy({ correo: updateUsuarioDto.correo });
      if (existingUsuario && existingUsuario.id !== id) {
        throw new Error('El correo ya está registrado por otro usuario');
      }
    }

    if (updateUsuarioDto.password) {
      const salt = await bcrypt.genSalt();
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, salt);
    }

    await this.usuarioRepository.update(id, updateUsuarioDto);
    const updatedUsuario = await this.usuarioRepository.findOneBy({ id });
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

    console.log('Usuarios eliminados:', data);

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
    return await this.usuarioRepository.findOneBy({ correo: email });
  }
}
