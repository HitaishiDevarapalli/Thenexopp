import { Injectable, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

export enum BucketType {
  KYC = 'private-kyc',
  PROPERTY = 'property-images',
  PAYMENT = 'payment-proofs',
}

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);
  private minioClient: Minio.Client;

  constructor(private readonly configService: ConfigService) {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = Number(this.configService.get<number>('MINIO_PORT', 9000));
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'thenexopp_minio_admin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'thenexopp_minio_secure_pass_2026');

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    await this.ensureBucketsExist();
  }

  private async ensureBucketsExist() {
    const buckets = [BucketType.KYC, BucketType.PROPERTY, BucketType.PAYMENT];
    for (const bucket of buckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket, 'us-east-1');
          this.logger.log(`Created MinIO bucket: ${bucket}`);
        }
      } catch (err) {
        this.logger.warn(`MinIO bucket init warning for ${bucket}: ${err.message}`);
      }
    }
  }

  async getPresignedUploadUrl(bucketType: BucketType, originalFilename: string, mimeType: string) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException('Invalid file format. Allowed: JPG, PNG, WEBP, PDF');
    }

    const fileExt = originalFilename.split('.').pop() || 'bin';
    const sanitizedExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fileKey = `${Date.now()}-${uuidv4()}.${sanitizedExt}`;

    try {
      const presignedUrl = await this.minioClient.presignedPutObject(bucketType, fileKey, 15 * 60); // 15 mins expiry
      return {
        success: true,
        data: {
          fileKey,
          bucket: bucketType,
          uploadUrl: presignedUrl,
          expiresInSeconds: 900,
        },
      };
    } catch (err) {
      this.logger.log(`MinIO offline; using local storage engine for: ${fileKey}`);
      const apiBase = this.configService.get<string>('API_BASE_URL', '/api/v2');
      return {
        success: true,
        data: {
          fileKey,
          bucket: bucketType,
          uploadUrl: `${apiBase}/uploads/local-mock-upload?key=${encodeURIComponent(fileKey)}&bucket=${bucketType}`,
          expiresInSeconds: 900,
        },
      };
    }
  }

  async getPresignedReadUrl(bucketType: BucketType, fileKey: string) {
    if (!fileKey) return null;
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://') || fileKey.startsWith('data:image/') || fileKey.startsWith('data:application/pdf')) {
      return fileKey;
    }
    try {
      return await this.minioClient.presignedGetObject(bucketType, fileKey, 30 * 60); // 30 mins
    } catch (err) {
      const apiBase = this.configService.get<string>('API_BASE_URL', '/api/v2');
      return `${apiBase}/uploads/local-mock-view?key=${encodeURIComponent(fileKey)}&bucket=${bucketType}`;
    }
  }
}
