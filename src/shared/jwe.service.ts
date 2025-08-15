import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { CompactEncrypt, compactDecrypt, importSPKI, importPKCS8 } from 'jose';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JweService implements OnModuleInit {
  private publicKey: CryptoKey;
  private privateKey: CryptoKey;

  async onModuleInit() {
    const pubKeyPath = path.join('src/key/public.pem');
    const privKeyPath = path.join('src/key/private.pem');
    const pubPem = fs.readFileSync(pubKeyPath, 'utf8');
    const privPem = fs.readFileSync(privKeyPath, 'utf8');
    this.publicKey = await importSPKI(pubPem, 'RSA-OAEP-256');
    this.privateKey = await importPKCS8(privPem, 'RSA-OAEP-256');
  }

  async encrypt(payload: object): Promise<string> {
    const encoder = new TextEncoder();
    const jwe = await new CompactEncrypt(encoder.encode(JSON.stringify(payload)))
      .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
      .encrypt(this.publicKey);
    return jwe;
  }

  async decrypt(jwe: string): Promise<any> {
    const { plaintext } = await compactDecrypt(jwe, this.privateKey);
    const decoded = new TextDecoder().decode(plaintext);
    return JSON.parse(decoded);
  }

    async verifyPayload(payload: any) {
    const now = Math.floor(Date.now() / 1000);
    if (!payload || (payload.exp && payload.exp < now)) {
      throw new UnauthorizedException('Token expired');
    }
    return payload;
  }
}
