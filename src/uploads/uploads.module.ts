import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [
    MulterModule.register({
      dest: './temp',
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
