import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FirebaseStorageService } from './firebase-storage.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly firebaseStorageService: FirebaseStorageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload image for posts' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: undefined, // Usar buffer em memória
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException(
              'Apenas arquivos de imagem são permitidos!',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }
    const url = await this.firebaseStorageService.uploadImage(file, 'posts');
    return {
      message: 'Imagem enviada com sucesso',
      url,
    };
  }
}
