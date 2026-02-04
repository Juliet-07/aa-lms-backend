import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReflectionDocument = Reflection & Document;

@Schema({ timestamps: true })
export class Reflection {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, required: true })
  moduleId: number;

  @Prop({ type: Number, required: true })
  segmentId: number; // Which segment in the module

  @Prop({ type: String, required: true })
  activityTitle: string;

  @Prop({
    type: [
      {
        promptId: { type: Number, required: true },
        question: { type: String, required: true },
        response: { type: String, required: true },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    required: true,
  })
  responses: Array<{
    promptId: number;
    question: string;
    response: string;
    submittedAt: Date;
  }>;

  @Prop({ type: Date, default: Date.now })
  completedAt: Date;
}

export const ReflectionSchema = SchemaFactory.createForClass(Reflection);

// Indexes for efficient queries
ReflectionSchema.index({ userId: 1, moduleId: 1, segmentId: 1 });
ReflectionSchema.index({ moduleId: 1 });
ReflectionSchema.index({ createdAt: -1 });