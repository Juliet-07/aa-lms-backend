import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reflection, ReflectionDocument } from '../../schemas';
import { User, UserDocument } from '../../schemas';

export interface SubmitReflectionDto {
  moduleId: number;
  segmentId: number;
  activityTitle: string;
  responses: Array<{
    promptId: number;
    question: string;
    response: string;
  }>;
}

@Injectable()
export class ReflectionService {
  constructor(
    @InjectModel(Reflection.name)
    private readonly reflectionModel: Model<ReflectionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async submitReflection(
    userId: string,
    dto: SubmitReflectionDto,
  ): Promise<Reflection> {
    // Check if reflection already exists for this user/module/segment
    const existing = await this.reflectionModel.findOne({
      userId,
      moduleId: dto.moduleId,
      segmentId: dto.segmentId,
    });

    if (existing) {
      // Update existing reflection
      existing.responses = dto.responses.map((r) => ({
        ...r,
        submittedAt: new Date(),
      }));
      existing.completedAt = new Date();
      await existing.save();
      return existing.toObject();
    }

    // Create new reflection
    const reflection = await this.reflectionModel.create({
      userId,
      moduleId: dto.moduleId,
      segmentId: dto.segmentId,
      activityTitle: dto.activityTitle,
      responses: dto.responses.map((r) => ({
        ...r,
        submittedAt: new Date(),
      })),
      completedAt: new Date(),
    });

    return reflection.toObject();
  }

  async getReflectionBySegment(
    userId: string,
    moduleId: number,
    segmentId: number,
  ): Promise<Reflection | null> {
    const reflection = await this.reflectionModel.findOne({
      userId,
      moduleId,
      segmentId,
    });

    return reflection;
  }

  async getUserReflections(userId: string): Promise<Reflection[]> {
    return this.reflectionModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getModuleReflections(moduleId: number): Promise<any[]> {
    const reflections = await this.reflectionModel
      .find({ moduleId })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    return reflections;
  }

  async getAllReflections(filters?: {
    moduleId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const query: any = {};

    if (filters?.moduleId) {
      query.moduleId = filters.moduleId;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const reflections = await this.reflectionModel
      .find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    return reflections;
  }

  async getReflectionStats(): Promise<any> {
    const totalReflections = await this.reflectionModel.countDocuments();

    const byModule = await this.reflectionModel.aggregate([
      {
        $group: {
          _id: '$moduleId',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const uniqueUsers = await this.reflectionModel.distinct('userId');

    return {
      totalReflections,
      totalUsers: uniqueUsers.length,
      byModule,
    };
  }

  async exportReflections(moduleId?: number): Promise<any[]> {
    const query = moduleId ? { moduleId } : {};

    const reflections = await this.reflectionModel
      .find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    // Format for export
    return reflections.map((reflection: any) => ({
      userName: `${reflection.userId?.firstName} ${reflection.userId?.lastName}`,
      userEmail: reflection.userId?.email,
      moduleId: reflection.moduleId,
      segmentId: reflection.segmentId,
      activityTitle: reflection.activityTitle,
      completedAt: reflection.completedAt,
      responses: reflection.responses.map((r) => ({
        question: r.question,
        response: r.response,
        submittedAt: r.submittedAt,
      })),
    }));
  }
}
