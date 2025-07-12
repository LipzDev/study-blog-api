import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { initializeApp, cert, App, AppOptions } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import type { Bucket, File } from '@google-cloud/storage';

@Injectable()
export class FirebaseStorageService {
  private firebaseApp: App;
  private storage: Storage;
  private bucket: Bucket;

  constructor() {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!bucketName) {
      throw new InternalServerErrorException(
        'FIREBASE_STORAGE_BUCKET não configurado',
      );
    }
    if (!serviceAccountJson) {
      throw new InternalServerErrorException(
        'FIREBASE_SERVICE_ACCOUNT_JSON não configurado',
      );
    }
    let serviceAccount: Record<string, unknown>;
    try {
      serviceAccount = JSON.parse(serviceAccountJson) as Record<
        string,
        unknown
      >;
    } catch {
      throw new InternalServerErrorException(
        'FIREBASE_SERVICE_ACCOUNT_JSON inválido',
      );
    }
    const options: AppOptions = {
      credential: cert(serviceAccount),
      storageBucket: bucketName,
    };
    this.firebaseApp = initializeApp(options);
    this.storage = getStorage(this.firebaseApp);
    this.bucket = this.storage.bucket() as unknown as Bucket;
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'images',
  ): Promise<string> {
    if (!file || !file.buffer || !file.originalname || !file.mimetype) {
      throw new InternalServerErrorException('Arquivo de imagem inválido');
    }
    const uniqueName = `${folder}/${uuidv4()}-${file.originalname}`;

    const fileUpload: File = this.bucket.file(uniqueName) as unknown as File;
    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        firebaseStorageDownloadTokens: uuidv4(),
      },
      public: true,
      validation: 'md5',
    });
    return `https://storage.googleapis.com/${this.bucket.name}/${uniqueName}`;
  }
}
