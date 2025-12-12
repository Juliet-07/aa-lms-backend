import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: true })
export class Progress {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  overallProgress: number;

  @Prop({ type: Number, default: 0 })
  completedModules: number;

  @Prop({ type: Number, default: 4 })
  totalModules: number;

  @Prop({ type: Number, default: null })
  currentModuleId: number;

  @Prop({ type: Date, default: null })
  courseStartedAt: Date;

  @Prop({ type: Date, default: null })
  lastAccessedAt: Date;

  @Prop({
    type: [
      {
        moduleId: { type: Number, required: true },
        title: { type: String, required: true },
        status: {
          type: String,
          enum: ['locked', 'in-progress', 'completed'],
          default: 'locked',
        },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        startedAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
        parts: [
          {
            partId: { type: Number, required: true },
            title: { type: String, required: true },
            completed: { type: Boolean, default: false },
            completedAt: { type: Date, default: null },
          },
        ],
      },
    ],
    default: [],
  })
  modules: Array<{
    moduleId: number;
    title: string;
    status: 'locked' | 'in-progress' | 'completed';
    progress: number;
    startedAt: Date;
    completedAt: Date;
    parts: Array<{
      partId: number;
      title: string;
      completed: boolean;
      completedAt: Date;
    }>;
  }>;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// Index for faster queries
ProgressSchema.index({ userId: 1 });
