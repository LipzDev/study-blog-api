import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { FirebaseStorageService } from './firebase-storage.service';

@Module({
  controllers: [UploadsController],
  providers: [FirebaseStorageService],
  exports: [FirebaseStorageService],
})
export class UploadsModule {}
