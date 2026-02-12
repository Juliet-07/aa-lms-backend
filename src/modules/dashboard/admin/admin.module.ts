import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ModuleStatisticsService } from './services/module-statistics.service';
import { UserAnalyticsService } from './services/user-analytics.service';
import {
  User,
  UserSchema,
  Progress,
  ProgressSchema,
  Reflection,
  ReflectionSchema,
} from '../../schemas';
import { LoggerModule } from 'src/common/logger/logger.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: Reflection.name, schema: ReflectionSchema },
    ]),
    LoggerModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, ModuleStatisticsService, UserAnalyticsService],
  exports: [AdminService],
})
export class AdminModule {}
