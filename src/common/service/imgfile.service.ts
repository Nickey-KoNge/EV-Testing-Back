// src/common/service/imgfile.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class ImgFileService {
  private s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_S3_REGION') || '';
    this.bucketName =
      this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY') || '',
        secretAccessKey:
          this.configService.get<string>('AWS_S3_SECRET_KEY') || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
  }

  async deleteFile(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    const fileKey = imageUrl.split(
      `${this.bucketName}.s3.${this.region}.amazonaws.com/`,
    )[1];

    if (fileKey) {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
        }),
      );
    }
  }
}
