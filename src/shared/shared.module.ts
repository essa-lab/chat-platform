import { Global, Module } from "@nestjs/common";
import { JweService } from "./jwe.service";
import { AzureStorageService } from "./azura.service";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JweAuthGuard } from "./jwe-auth.guard";
import { PrismaService } from "prisma/prisma.service";

@Global()
@Module({
    imports:[ConfigModule.forRoot()],
  providers: [PrismaService,JweService,AzureStorageService,{
      provide: APP_GUARD,
      useClass: JweAuthGuard,
    }],
  exports: [JweService,AzureStorageService,PrismaService],
})
export class SharedModule {}