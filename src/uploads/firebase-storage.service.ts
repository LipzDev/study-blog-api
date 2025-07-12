import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  initializeApp,
  cert,
  App,
  AppOptions,
  getApps,
  getApp,
} from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import type { Bucket, File } from '@google-cloud/storage';
import type { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseStorageService {
  private firebaseApp: App;
  private storage: Storage;
  private bucket: Bucket;

  constructor() {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

    // Checagem dos campos obrigatórios do service account
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
    ];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new InternalServerErrorException(
          `Variável de ambiente do Firebase faltando: ${varName}`,
        );
      }
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY!;
    // Montar o objeto de credenciais com todos os campos
    const serviceAccount: ServiceAccount & Record<string, string | undefined> =
      {
        type: process.env.FIREBASE_TYPE ?? 'service_account',
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        clientId: process.env.FIREBASE_CLIENT_ID,
        authUri: process.env.FIREBASE_AUTH_URI,
        tokenUri: process.env.FIREBASE_TOKEN_URI,
        authProviderX509CertUrl:
          process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        clientC509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universeDomain: process.env.FIREBASE_UNIVERSE_DOMAIN,
      };

    if (!bucketName) {
      throw new InternalServerErrorException(
        'FIREBASE_STORAGE_BUCKET não configurado',
      );
    }

    const options: AppOptions = {
      credential: cert(serviceAccount),
      storageBucket: bucketName,
    };
    let firebaseApp: App;
    if (getApps().length === 0) {
      firebaseApp = initializeApp(options);
    } else {
      firebaseApp = getApp();
    }
    this.firebaseApp = firebaseApp;
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
