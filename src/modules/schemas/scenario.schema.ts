import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScenarioDocument = Scenario & Document;

@Schema({ timestamps: true })
export class Scenario {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  moduleId: number;

  @Prop({ required: true })
  segmentId: number;

  @Prop({ required: true })
  activityTitle: string;

  @Prop({ required: true })
  scenario: string;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  response: string;

  @Prop({ type: Date, default: Date.now })
  completedAt: Date;
}

export const ScenarioSchema = SchemaFactory.createForClass(Scenario);
