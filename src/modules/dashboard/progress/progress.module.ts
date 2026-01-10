import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { Progress, ProgressSchema, User, UserSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [MongooseModule, ProgressService],
})
export class ProgressModule {}
