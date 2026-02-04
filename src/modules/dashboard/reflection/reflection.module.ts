import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReflectionController } from './reflection.controller';
import { ReflectionService } from './reflection.service';
import { Reflection, ReflectionSchema } from '../../schemas';
import { User, UserSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reflection.name, schema: ReflectionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ReflectionController],
  providers: [ReflectionService],
  exports: [ReflectionService],
})
export class ReflectionModule {}