import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DeliveryModule } from './delivery/delivery.module';
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, DeliveryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
