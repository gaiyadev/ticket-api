import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from './wallet/wallet.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env['LOCAL_DATABASE_HOST'],
      port: Number(process.env.LOCAL_DATABASE_PORT),
      username: process.env['LOCAL_DATABASE_USER'],
      password: process.env['LOCAL_DATABASE_PASSWORD'],
      database: process.env.LOCAL_DATABASE_NAME,
      entities: [],
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
