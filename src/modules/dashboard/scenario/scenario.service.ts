import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Scenario, ScenarioDocument } from '../../schemas';

export interface SubmitScenarioDto {
  moduleId: number;
  segmentId: number;
  activityTitle: string;
  scenario: string;
  question: string;
  response: string;
}

@Injectable()
export class ScenarioService {
  constructor(
    @InjectModel(Scenario.name)
    private readonly scenarioModel: Model<ScenarioDocument>,
  ) {}

  async submitScenario(
    userId: string,
    dto: SubmitScenarioDto,
  ): Promise<Scenario> {
    const existing = await this.scenarioModel.findOne({
      userId,
      moduleId: dto.moduleId,
      segmentId: dto.segmentId,
    });

    if (existing) {
      existing.response = dto.response;
      existing.completedAt = new Date();
      await existing.save();
      return existing.toObject();
    }

    const scenario = await this.scenarioModel.create({
      userId,
      ...dto,
      completedAt: new Date(),
    });

    return scenario.toObject();
  }

  async getScenarioBySegment(
    userId: string,
    moduleId: number,
    segmentId: number,
  ): Promise<Scenario | null> {
    return this.scenarioModel.findOne({ userId, moduleId, segmentId }).lean();
  }

  async getUserScenarios(userId: string): Promise<Scenario[]> {
    return this.scenarioModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getAllScenarios(filters?: {
    moduleId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const query: any = {};

    if (filters?.moduleId) query.moduleId = filters.moduleId;

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    return this.scenarioModel
      .find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getScenarioStats(): Promise<any> {
    const totalScenarios = await this.scenarioModel.countDocuments();
    const uniqueUsers = await this.scenarioModel.distinct('userId');

    const byModule = await this.scenarioModel.aggregate([
      { $group: { _id: '$moduleId', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return {
      totalScenarios,
      totalUsers: uniqueUsers.length,
      byModule,
    };
  }
}
