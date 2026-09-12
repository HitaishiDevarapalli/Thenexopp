import { Controller, Post, Put, Body, UseGuards, Get, Query, HttpCode, HttpStatus, Req, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UploadsService, BucketType } from './uploads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

class PresignedUrlDto {
  @ApiProperty({ enum: BucketType, example: BucketType.KYC })
  @IsNotEmpty()
  @IsEnum(BucketType)
  bucketType: BucketType;

  @ApiProperty({ example: 'photo.jpg' })
  @IsNotEmpty()
  @IsString()
  filename: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsNotEmpty()
  @IsString()
  mimeType: string;
}

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('direct-upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Direct multipart or base64 file upload' })
  async handleDirectUpload(
    @UploadedFile() file: any,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const bucket = body.bucketType || body.bucket || 'common';
    const uploadDir = path.resolve('uploads', bucket);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const host = req.get('host') || 'localhost:3000';
    const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
    const baseUrl = `${proto}://${host}/api/v1`;

    if (file && file.buffer) {
      const ext = path.extname(file.originalname || '.jpg').toLowerCase() || '.jpg';
      const fileKey = `${Date.now()}-${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, fileKey);
      fs.writeFileSync(filePath, file.buffer);
      const viewUrl = `${baseUrl}/uploads/local-mock-view?key=${fileKey}&bucket=${bucket}`;
      return {
        success: true,
        data: {
          fileKey,
          bucket,
          viewUrl,
        },
      };
    }

    if (body.base64Data) {
      let base64String = body.base64Data;
      let ext = '.jpg';
      if (base64String.startsWith('data:image/')) {
        const parts = base64String.split(';base64,');
        const mime = parts[0].replace('data:', '');
        if (mime.includes('png')) ext = '.png';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('avif')) ext = '.avif';
        base64String = parts[1];
      } else if (body.filename && path.extname(body.filename)) {
        ext = path.extname(body.filename).toLowerCase();
      }
      const buffer = Buffer.from(base64String, 'base64');
      const fileKey = `${Date.now()}-${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, fileKey);
      fs.writeFileSync(filePath, buffer);
      const viewUrl = `${baseUrl}/uploads/local-mock-view?key=${fileKey}&bucket=${bucket}`;
      return {
        success: true,
        data: {
          fileKey,
          bucket,
          viewUrl,
        },
      };
    }

    throw new BadRequestException('No file provided in multipart or base64');
  }

  @Post('presigned-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate presigned S3 upload URL for private bucket storage' })
  async getPresignedUploadUrl(@Body() body: PresignedUrlDto) {
    return this.uploadsService.getPresignedUploadUrl(body.bucketType, body.filename, body.mimeType);
  }

  @Get('secure-view-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate presigned read URL for private KYC / payment proof files' })
  async getPresignedReadUrl(@Query('bucket') bucket: BucketType, @Query('key') key: string) {
    const url = await this.uploadsService.getPresignedReadUrl(bucket, key);
    return { success: true, data: { viewUrl: url } };
  }

  @Put('local-mock-upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Local fallback upload storage' })
  async handleLocalUpload(
    @Query('key') key: string,
    @Query('bucket') bucket: string,
    @Req() req: any,
  ) {
    const uploadDir = path.resolve('uploads', bucket || 'common');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const cleanKey = path.basename(key || `${Date.now()}.jpg`);
    const filePath = path.join(uploadDir, cleanKey);

    if (req.body && Buffer.isBuffer(req.body) && req.body.length > 0) {
      fs.writeFileSync(filePath, req.body);
      return { success: true, fileKey: cleanKey };
    }

    if (req.body && typeof req.body === 'object') {
      if (req.body.base64Data) {
        let b64 = req.body.base64Data;
        if (b64.includes(';base64,')) b64 = b64.split(';base64,')[1];
        fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
        return { success: true, fileKey: cleanKey };
      }
    }

    const fileStream = fs.createWriteStream(filePath);
    req.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on('finish', () => resolve({ success: true, fileKey: cleanKey }));
      fileStream.on('error', (err) => reject(err));
    });
  }

  @Get('local-mock-view')
  @ApiOperation({ summary: 'Local fallback file viewer' })
  async handleLocalView(
    @Query('key') key: string,
    @Query('bucket') bucket: string,
    @Res() res: Response,
  ) {
    if (!key) return res.status(404).send('No file key provided');
    const cleanKey = path.basename(key);
    
    // 1. Direct path in requested bucket
    let filePath = path.resolve('uploads', bucket || 'common', cleanKey);
    
    // 2. Search across all known bucket directories if not found in requested bucket
    if (!fs.existsSync(filePath)) {
      const searchBuckets = ['property-images', 'private-kyc', 'payment-proofs', 'common'];
      for (const b of searchBuckets) {
        const candidate = path.resolve('uploads', b, cleanKey);
        if (fs.existsSync(candidate)) {
          filePath = candidate;
          break;
        }
      }
    }

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 0) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.avif': 'image/avif',
          '.pdf': 'application/pdf',
        };
        res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(404).send('Photo not found on server storage');
  }
}
