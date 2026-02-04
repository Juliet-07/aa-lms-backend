import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { ProgressModule } from './modules/dashboard/progress/progress.module';
import { ReflectionModule } from './modules/dashboard/reflection/reflection.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => {
        if (!config.MONGO_URI) throw new Error('MONGO_URI is not defined');
        return config;
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (ConfigService: ConfigService) => ({
        uri: ConfigService.get<string>('MONGO_URI'),
        // useNewUrlParser: true,
        // useUnifiedTopoloy: true,
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
    AuthModule,
    ProgressModule,
    ReflectionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
