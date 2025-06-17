import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UploadsController', () => {
  let controller: UploadsController;

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024000, // 1MB
    destination: './uploads/images',
    filename: 'image-1234567890-123456789.jpg',
    path: './uploads/images/image-1234567890-123456789.jpg',
    buffer: Buffer.from('fake-image-data'),
    stream: {} as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UploadsController>(UploadsController);
  });

  describe('uploadImage', () => {
    it('should upload image successfully', () => {
      const result = controller.uploadImage(mockFile);

      expect(result).toEqual({
        message: 'Imagem enviada com sucesso',
        filename: mockFile.filename,
        originalName: mockFile.originalname,
        size: mockFile.size,
        url: `/uploads/images/${mockFile.filename}`,
      });
    });

    it('should throw BadRequestException when no file is provided', () => {
      expect(() => controller.uploadImage(undefined as any)).toThrow(
        BadRequestException,
      );
      expect(() => controller.uploadImage(undefined as any)).toThrow(
        'Nenhum arquivo foi enviado',
      );
    });

    it('should throw BadRequestException when file is null', () => {
      expect(() => controller.uploadImage(null as any)).toThrow(
        BadRequestException,
      );
      expect(() => controller.uploadImage(null as any)).toThrow(
        'Nenhum arquivo foi enviado',
      );
    });

    it('should handle different image types', () => {
      const pngFile = {
        ...mockFile,
        originalname: 'test-image.png',
        mimetype: 'image/png',
        filename: 'image-1234567890-123456789.png',
      };

      const result = controller.uploadImage(pngFile);

      expect(result).toEqual({
        message: 'Imagem enviada com sucesso',
        filename: pngFile.filename,
        originalName: pngFile.originalname,
        size: pngFile.size,
        url: `/uploads/images/${pngFile.filename}`,
      });
    });

    it('should handle large files within limit', () => {
      const largeFile = {
        ...mockFile,
        size: 4 * 1024 * 1024, // 4MB (within 5MB limit)
      };

      const result = controller.uploadImage(largeFile);

      expect(result).toEqual({
        message: 'Imagem enviada com sucesso',
        filename: largeFile.filename,
        originalName: largeFile.originalname,
        size: largeFile.size,
        url: `/uploads/images/${largeFile.filename}`,
      });
    });

    it('should generate correct URL path', () => {
      const customFile = {
        ...mockFile,
        filename: 'custom-filename-123.jpg',
      };

      const result = controller.uploadImage(customFile);

      expect(result.url).toBe('/uploads/images/custom-filename-123.jpg');
    });

    it('should preserve original filename in response', () => {
      const fileWithSpecialName = {
        ...mockFile,
        originalname: 'My Special Image (1).jpeg',
      };

      const result = controller.uploadImage(fileWithSpecialName);

      expect(result.originalName).toBe('My Special Image (1).jpeg');
    });

    it('should return correct file size', () => {
      const smallFile = {
        ...mockFile,
        size: 512000, // 512KB
      };

      const result = controller.uploadImage(smallFile);

      expect(result.size).toBe(512000);
    });
  });

  describe('file validation (integration with multer)', () => {
    // These tests would be more relevant in integration tests
    // since the actual file validation is handled by multer middleware

    it('should be protected by JWT auth guard', () => {
      const guards = Reflect.getMetadata('__guards__', controller.uploadImage);
      expect(guards).toBeDefined();
    });

    it('should have correct API decorators', () => {
      const apiTags = Reflect.getMetadata(
        'swagger/apiUseTags',
        UploadsController,
      );
      expect(apiTags).toContain('Uploads');
    });
  });

  describe('error handling', () => {
    it('should handle undefined file gracefully', () => {
      expect(() => controller.uploadImage(undefined as any)).toThrow(
        'Nenhum arquivo foi enviado',
      );
    });

    it('should handle null file gracefully', () => {
      expect(() => controller.uploadImage(null as any)).toThrow(
        'Nenhum arquivo foi enviado',
      );
    });

    it('should provide meaningful error messages', () => {
      try {
        controller.uploadImage(undefined as any);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Nenhum arquivo foi enviado');
      }
    });
  });

  describe('response format', () => {
    it('should return consistent response structure', () => {
      const result = controller.uploadImage(mockFile);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('originalName');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('url');

      expect(typeof result.message).toBe('string');
      expect(typeof result.filename).toBe('string');
      expect(typeof result.originalName).toBe('string');
      expect(typeof result.size).toBe('number');
      expect(typeof result.url).toBe('string');
    });

    it('should have success message in Portuguese', () => {
      const result = controller.uploadImage(mockFile);

      expect(result.message).toBe('Imagem enviada com sucesso');
    });

    it('should generate URL with correct format', () => {
      const result = controller.uploadImage(mockFile);

      expect(result.url).toMatch(
        /^\/uploads\/images\/.+\.(jpg|jpeg|png|gif|webp)$/,
      );
    });
  });
});
