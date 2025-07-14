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

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Omit<Usuario, 'contraseña'>> {
    const existingUsuario = await this.usuarioRepository.findOneBy({ correo: createUsuarioDto.correo });
    if (existingUsuario) {
      throw new Error('El correo ya está registrado');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUsuarioDto.contraseña, salt);
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      contraseña: hashedPassword,
    });
    const savedUsuario = await this.usuarioRepository.save(usuario);
    const { contraseña, ...usuarioSinContraseña } = savedUsuario;
    return usuarioSinContraseña;
  }

  async findAll(query: { page?: number; limit?: number }): Promise<{ data: Omit<Usuario, 'contraseña'>[]; total: number; page: number; lastPage: number }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.usuarioRepository.findAndCount({
      skip,
      take: limit,
    });

    const sanitizedData = data.map(({ contraseña, ...usuarioSinContraseña }) => usuarioSinContraseña);

    return {
      data: sanitizedData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Omit<Usuario, 'contraseña'> | null> {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      return null;
    }
    const { contraseña, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Omit<Usuario, 'contraseña'> | null> {
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

    if (updateUsuarioDto.contraseña) {
      const salt = await bcrypt.genSalt();
      updateUsuarioDto.contraseña = await bcrypt.hash(updateUsuarioDto.contraseña, salt);
    }

    await this.usuarioRepository.update(id, updateUsuarioDto);
    const updatedUsuario = await this.usuarioRepository.findOneBy({ id });
    if (!updatedUsuario) {
      return null;
    }
    const { contraseña, ...usuarioSinContraseña } = updatedUsuario;
    return usuarioSinContraseña;
  }

  async remove(id: number): Promise<Omit<Usuario, 'contraseña'> | null> {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      throw new Error('El usuario no existe');
    }
    await this.usuarioRepository.softRemove(usuario);
    const { contraseña, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }

  async findDeleted(query: { page?: number; limit?: number }): Promise<{ data: Omit<Usuario, 'contraseña'>[]; total: number; page: number; lastPage: number }> {
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

    const sanitizedData = data.map(({ contraseña, ...usuarioSinContraseña }) => usuarioSinContraseña);

    return {
      data: sanitizedData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async restore(id: number): Promise<Omit<Usuario, 'contraseña'> | null> {
    const usuario = await this.usuarioRepository.findOne({ where: { id }, withDeleted: true });
    if (!usuario) {
      throw new Error('El usuario no existe o no está eliminado');
    }
    await this.usuarioRepository.recover(usuario);
    const { contraseña, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }
}
