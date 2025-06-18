import { Test, TestingModule } from '@nestjs/testing';
import { ClientesService } from './clientes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

describe('ClientesService', () => {
  let service: ClientesService;
  let clienteRepository: jest.Mocked<Partial<Repository<Cliente>>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: getRepositoryToken(Cliente),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
    clienteRepository = module.get(getRepositoryToken(Cliente));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a cliente', async () => {
    const dto: CreateClienteDto = { nombre: 'Test', slug: 'test' };
    const entity: Cliente = { id: 1, ...dto };
    (clienteRepository.create as jest.Mock).mockReturnValue(entity);
    (clienteRepository.save as jest.Mock).mockResolvedValue(entity);

    const result = await service.create(dto);
    expect(clienteRepository.create).toHaveBeenCalledWith(dto);
    expect(clienteRepository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('should return all clientes', async () => {
    const clientes: Cliente[] = [{ id: 1, nombre: 'Test', slug: 'test' }];
    (clienteRepository.find as jest.Mock).mockResolvedValue(clientes);

    const result = await service.findAll();
    expect(clienteRepository.find).toHaveBeenCalled();
    expect(result).toEqual(clientes);
  });

  it('should return one cliente by id', async () => {
    const cliente: Cliente = { id: 1, nombre: 'Test', slug: 'test' };
    (clienteRepository.findOneBy as jest.Mock).mockResolvedValue(cliente);

    const result = await service.findOne(1);
    expect(clienteRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(cliente);
  });

  it('should update a cliente', async () => {
    const dto: UpdateClienteDto = { nombre: 'Nuevo' };
    const updateResult = { affected: 1 };
    (clienteRepository.update as jest.Mock).mockResolvedValue(updateResult);

    const result = await service.update(1, dto);
    expect(clienteRepository.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(updateResult);
  });

  it('should remove a cliente', async () => {
    const deleteResult = { affected: 1 };
    (clienteRepository.delete as jest.Mock).mockResolvedValue(deleteResult);

    const result = await service.remove(1);
    expect(clienteRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual(deleteResult);
  });
});