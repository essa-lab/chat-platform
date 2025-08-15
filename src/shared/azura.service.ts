// src/storage/azure-storage.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { BlobSASPermissions, BlobServiceClient, generateBlobSASQueryParameters, SASProtocol, StorageSharedKeyCredential } from '@azure/storage-blob';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class AzureStorageService {
  private blobServiceClient: BlobServiceClient;

  constructor(private configService: ConfigService) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
       this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING')!,
    );
  }

   bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

   async uploadFile(
  buffer: Buffer,
    filename: string,
    mimetype: string,
    size: number,
  ): Promise<{url:string,name:string}> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimetype)) {
      throw new BadRequestException('Invalid file type');
    }
  

    if (size > 10 * 1024 * 1024) {
      throw new BadRequestException('File too large');
    }

    const stream = this.bufferToStream(buffer);


    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(filename)}`;

    const containerName = this.configService.get<string>('AZURE_CONTAINER_NAME');
  console.log(containerName)

    if (!containerName) {
      throw new Error('Azure container name is not configured');
    }

    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);

    await blockBlobClient.uploadStream(stream, 4 * 1024 * 1024, 20, {
      blobHTTPHeaders: { blobContentType: mimetype },
    });
    return {url:blockBlobClient.url,name:blockBlobClient.name};
  }



async  getDownloadLink( blobName: string) {
  const containerName = this.configService.get<string>('AZURE_CONTAINER_NAME')!
  const containerClient = this.blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  //1hour expiration
  const expiresOn = new Date(new Date().valueOf() + 3600 * 1000);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn,
      protocol: SASProtocol.Https
    },
      this.blobServiceClient.credential as StorageSharedKeyCredential
  ).toString();

  return `${blobClient.url}?${sasToken}`;
}

}
