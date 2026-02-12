// admin/admin.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  Progress,
  ProgressDocument,
  Reflection,
  ReflectionDocument,
} from '../../schemas';
import { LoggerService } from 'src/common/logger/logger.service';
import { ModuleStatisticsService } from './services/module-statistics.service';
import { UserAnalyticsService } from './services/user-analytics.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Progress.name)
    private readonly progressModel: Model<ProgressDocument>,
    @InjectModel(Reflection.name)
    private readonly reflectionModel: Model<ReflectionDocument>,
    private readonly moduleStatsService: ModuleStatisticsService,
    private readonly userAnalyticsService: UserAnalyticsService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AdminService.name);
  }

  private async verifyAdmin(adminUserId: string) {
    const admin = await this.userModel.findById(adminUserId).lean();
    if (!admin || admin.role !== 'admin') {
      throw new UnauthorizedException('Only admins can access this resource');
    }
    return admin;
  }

  async getDashboardStats(adminUserId: string) {
    await this.verifyAdmin(adminUserId);

    try {
      const totalLearners = await this.userModel.countDocuments({
        role: 'user',
        deletedAt: null,
      });

      const activeModules = 4;

      const certificatesIssued = await this.progressModel.countDocuments({
        certificateEarned: true,
      });

      const progressRecords = await this.progressModel
        .find()
        .select('overallProgress')
        .lean();

      let completionRate = 0;
      if (progressRecords.length > 0) {
        const totalProgress = progressRecords.reduce(
          (sum, p) => sum + (p.overallProgress || 0),
          0,
        );
        completionRate = Math.round(totalProgress / progressRecords.length);
      }

      return {
        totalLearners,
        activeModules,
        completionRate,
        certificatesIssued,
      };
    } catch (error) {
      this.logger.error('Error fetching dashboard stats', error);
      throw error;
    }
  }

  async getRecentLearners(adminUserId: string, limit: number = 5) {
    await this.verifyAdmin(adminUserId);
    return this.userAnalyticsService.getRecentLearners(limit);
  }

  async getTopPerformingModules(adminUserId: string, limit: number = 3) {
    await this.verifyAdmin(adminUserId);
    return this.moduleStatsService.getTopPerformingModules(limit);
  }

  async getAllUsers(adminUserId: string) {
    await this.verifyAdmin(adminUserId);
    return this.userAnalyticsService.getAllUsers();
  }

  async getUserAnalytics(adminUserId: string) {
    await this.verifyAdmin(adminUserId);
    const analytics = await this.userAnalyticsService.getUserAnalytics();
    const moduleStats =
      await this.moduleStatsService.getModuleCompletionStats();

    return {
      ...analytics,
      moduleCompletionStats: moduleStats,
    };
  }

  async getModuleStatistics(adminUserId: string) {
    await this.verifyAdmin(adminUserId);
    return this.moduleStatsService.getModuleStatistics();
  }

  async getAllReflections(
    adminUserId: string,
    filters?: {
      moduleId?: number;
      segmentId?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    await this.verifyAdmin(adminUserId);

    try {
      const query: any = {};

      if (filters?.moduleId) {
        query.moduleId = filters.moduleId;
      }

      if (filters?.segmentId) {
        query.segmentId = filters.segmentId;
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
    } catch (error) {
      this.logger.error('Error fetching all reflections', error);
      throw error;
    }
  }

  async getReflectionsByModule(adminUserId: string, moduleId: number) {
    await this.verifyAdmin(adminUserId);

    try {
      const reflections = await this.reflectionModel
        .find({ moduleId })
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

      return reflections;
    } catch (error) {
      this.logger.error(
        `Error fetching reflections for module ${moduleId}`,
        error,
      );
      throw error;
    }
  }

  async getReflectionsByUser(adminUserId: string, userId: string) {
    await this.verifyAdmin(adminUserId);

    try {
      const reflections = await this.reflectionModel
        .find({ userId })
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

      return reflections;
    } catch (error) {
      this.logger.error(`Error fetching reflections for user ${userId}`, error);
      throw error;
    }
  }

  async getReflectionStats(adminUserId: string) {
    await this.verifyAdmin(adminUserId);

    try {
      const totalReflections = await this.reflectionModel.countDocuments();

      // Reflections by module
      const byModule = await this.reflectionModel.aggregate([
        {
          $group: {
            _id: '$moduleId',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            moduleId: '$_id',
            count: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
          },
        },
        {
          $sort: { moduleId: 1 },
        },
      ]);

      // Reflections by segment
      const bySegment = await this.reflectionModel.aggregate([
        {
          $group: {
            _id: { moduleId: '$moduleId', segmentId: '$segmentId' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.moduleId': 1, '_id.segmentId': 1 },
        },
      ]);

      // Unique users who submitted reflections
      const uniqueUsers = await this.reflectionModel.distinct('userId');

      // Recent reflections (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentReflections = await this.reflectionModel.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      // Reflections over time (last 30 days)
      const reflectionsOverTime = await this.reflectionModel.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return {
        totalReflections,
        totalUsers: uniqueUsers.length,
        recentReflections,
        byModule,
        bySegment,
        reflectionsOverTime,
      };
    } catch (error) {
      this.logger.error('Error fetching reflection stats', error);
      throw error;
    }
  }

  async exportReflections(adminUserId: string, moduleId?: number) {
    await this.verifyAdmin(adminUserId);

    try {
      const query = moduleId ? { moduleId } : {};

      const reflections = await this.reflectionModel
        .find(query)
        .populate('userId', 'firstName lastName email phoneNumber')
        .sort({ createdAt: -1 })
        .lean();

      // Format for export
      return reflections.map((reflection: any) => ({
        userName: `${reflection.userId?.firstName} ${reflection.userId?.lastName}`,
        userEmail: reflection.userId?.email,
        userPhone: reflection.userId?.phoneNumber,
        moduleId: reflection.moduleId,
        segmentId: reflection.segmentId,
        activityTitle: reflection.activityTitle,
        completedAt: reflection.completedAt,
        submittedAt: reflection.createdAt,
        responses: reflection.responses.map((r) => ({
          promptId: r.promptId,
          question: r.question,
          response: r.response,
          submittedAt: r.submittedAt,
        })),
      }));
    } catch (error) {
      this.logger.error('Error exporting reflections', error);
      throw error;
    }
  }
}
