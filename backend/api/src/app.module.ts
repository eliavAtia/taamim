import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TaamimModule } from './modules/taamim/taamim.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { AudioModule } from './modules/audio/audio.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    TaamimModule,
    GamificationModule,
    AudioModule,
    AuthModule,
  ],
})
export class AppModule {}
