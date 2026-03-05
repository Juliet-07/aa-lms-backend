import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScenarioController } from './scenario.controller';
import { ScenarioService } from './scenario.service';
import { Scenario, ScenarioSchema } from '../../schemas';
import { User, UserSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Scenario.name, schema: ScenarioSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ScenarioController],
  providers: [ScenarioService],
  exports: [ScenarioService],
})
export class ScenarioModule {}
