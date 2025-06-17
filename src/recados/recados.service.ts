import { Injectable, NotFoundException } from '@nestjs/common';
import { Recado } from './entities/recado.entity';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RecadosService {
  // O serviço é responsável por conter as regras de negócio e manipular os dados
  // O serviço não deve conter lógica de apresentação, apenas manipulação de dados
  // O serviço deve ser injetado no controller para ser utilizado
  // O serviço pode ser injetado em outros serviços para reutilização de lógica

  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>, // Injeção do repositório TypeORM para a entidade Recado
  ) {}

  throwNotFoundException(message: string) {
    throw new NotFoundException(message);
  }

  async fingAll() {
    const recados = await this.recadoRepository.find();
    return recados;
  }

  async findOne(id: number) {
    const recado = await this.recadoRepository.findOne({
      where: { id },
    });

    if (!recado) {
      this.throwNotFoundException('Não foi possível encontrar o recado');
    }

    return recado;
  }

  async create(createRecadoDto: CreateRecadoDto) {
    const novoRecado = {
      ...createRecadoDto,
      lido: false,
      data: new Date(),
    };

    const recado = this.recadoRepository.create(novoRecado);

    return this.recadoRepository.save(recado);
  }

  async update(id: number, updateRecadoDto: UpdateRecadoDto) {
    const partialUpdateRecadoDto = {
      lido: updateRecadoDto?.lido,
      texto: updateRecadoDto?.texto,
    };

    const recado = await this.recadoRepository.preload({
      id,
      ...partialUpdateRecadoDto,
    });

    if (!recado) {
      this.throwNotFoundException('Não foi possível encontrar o recado');
    }

    await this.recadoRepository.save(recado as Recado);
    return { message: 'Recado editado com sucesso' };
  }

  async remove(id: number) {
    const recado = await this.recadoRepository.findOneBy({
      id,
    });

    if (!recado) {
      this.throwNotFoundException(
        'Não foi possível encontrar o recado para remover',
      );
    }

    await this.recadoRepository.remove(recado as Recado);
    return { message: 'Recado removido com sucesso' };
  }
}
