import { Module } from '@nestjs/common';
import { RecadosController } from './recados.controller';
import { RecadosService } from './recados.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recado } from './entities/recado.entity';

// O módulo é responsável por agrupar os controllers e serviços relacionados
// O módulo deve ser injetado no aplicativo principal para ser utilizado
// O módulo pode ser injetado em outros módulos para reutilização de lógica

@Module({
  imports: [TypeOrmModule.forFeature([Recado])], // Adicione suas entidades aqui, se necessário
  controllers: [RecadosController],
  providers: [RecadosService],
})
export class RecadosModule {}
