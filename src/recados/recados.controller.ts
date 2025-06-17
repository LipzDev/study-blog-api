import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { CreateRecadoDto } from './dto/create-recado.dto';

@Controller('recados')
export class RecadosController {
  // O controller é responsável por receber as requisições e chamar os serviços
  // O controller não deve conter regras de negócio, apenas delegar para os serviços
  // O controller deve ser injetado no módulo para ser utilizado
  // O controller pode ser injetado em outros controllers para reutilização de lógica
  // O controller deve ser responsável por receber os dados da requisição e enviar a resposta
  // O controller deve ser responsável por validar os dados da requisição antes de enviar para o serviço

  constructor(private readonly request: RecadosService) {}

  @Get()
  fingAll() {
    return this.request.fingAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.request.findOne(id);
  }

  @Post()
  create(@Body() createRecadoDto: CreateRecadoDto) {
    return this.request.create(createRecadoDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecadoDto: UpdateRecadoDto,
  ) {
    return this.request.update(id, updateRecadoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.request.remove(id);
  }
}
