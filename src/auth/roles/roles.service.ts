import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const permisos = await this.permissionRepository.findByIds(dto.permisos);
    const role = this.roleRepository.create({ nombre: dto.nombre, permisos });
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permisos'] });
  }

  async findOne(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id }, relations: ['permisos'] });
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role | null> {
    const role = await this.findOne(id);
    if (!role) return null;
    if (dto.nombre) role.nombre = dto.nombre;
    if (dto.permisos) {
      role.permisos = await this.permissionRepository.findByIds(dto.permisos);
    }
    await this.roleRepository.save(role);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async createIfNotExists(dto: { nombre: string; permisos: number[] }) {
    const existing = await this.roleRepository.findOne({ where: { nombre: dto.nombre } });
    if (existing) return existing;
    return this.create(dto);
  }
}
