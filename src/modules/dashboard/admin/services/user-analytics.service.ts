import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  Progress,
  ProgressDocument,
} from '../../../schemas';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class UserAnalyticsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Progress.name)
    private readonly progressModel: Model<ProgressDocument>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserAnalyticsService.name);
  }

  async getRecentLearners(limit: number = 5) {
    try {
      const recentUsers = await this.userModel
        .find({ role: 'user', deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('firstName lastName email createdAt')
        .lean();

      const userIds = recentUsers.map((u) => u._id);
      const progressData = await this.progressModel
        .find({ userId: { $in: userIds } })
        .select('userId overallProgress')
        .lean();

      const progressMap = new Map(
        progressData.map((p) => [p.userId.toString(), p]),
      );

      return recentUsers.map((user) => {
        const progress = progressMap.get(user._id.toString());
        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          progress: progress ? Math.round(progress.overallProgress || 0) : 0,
          //   joinedAt: user.createdAt,
        };
      });
    } catch (error) {
      this.logger.error('Error fetching recent learners', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const users = await this.userModel
        .find({ role: 'user', deletedAt: null })
        .select('-password -plainPassword')
        .sort({ createdAt: -1 })
        .lean();

      const userIds = users.map((user) => user._id);
      const progressData = await this.progressModel
        .find({ userId: { $in: userIds } })
        .lean();

      const progressMap = new Map(
        progressData.map((p) => [p.userId.toString(), p]),
      );

      return users.map((user) => {
        const progress = progressMap.get(user._id.toString());
        return {
          ...user,
          hasStartedCourse: progress ? !!progress.courseStartedAt : false,
          progressSummary: progress
            ? {
                overallProgress: progress.overallProgress,
                completedModules: progress.completedModules,
                currentModuleId: progress.currentModuleId,
                certificateEarned: progress.certificateEarned,
                averageScore: progress.averageScore,
              }
            : null,
        };
      });
    } catch (error) {
      this.logger.error('Error fetching all users', error);
      throw error;
    }
  }

  async getUserAnalytics() {
    try {
      const totalUsers = await this.userModel.countDocuments({
        role: 'user',
        deletedAt: null,
      });

      const activeUsers = await this.progressModel.countDocuments({
        courseStartedAt: { $ne: null },
      });

      const completedUsers = await this.progressModel.countDocuments({
        completedModules: 4,
      });

      const certifiedUsers = await this.progressModel.countDocuments({
        certificateEarned: true,
      });

      const progressRecords = await this.progressModel
        .find()
        .select('overallProgress')
        .lean();

      const completionDistribution = {
        notStarted: totalUsers - activeUsers,
        '0-25': 0,
        '26-50': 0,
        '51-75': 0,
        '76-99': 0,
        completed: completedUsers,
      };

      progressRecords.forEach((record) => {
        const progress = record.overallProgress || 0;
        if (progress > 0 && progress <= 25) completionDistribution['0-25']++;
        else if (progress > 25 && progress <= 50)
          completionDistribution['26-50']++;
        else if (progress > 50 && progress <= 75)
          completionDistribution['51-75']++;
        else if (progress > 75 && progress < 100)
          completionDistribution['76-99']++;
      });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newUsersOverTime = await this.userModel.aggregate([
        {
          $match: {
            role: 'user',
            deletedAt: null,
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
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        completedUsers,
        certifiedUsers,
        completionDistribution,
        newUsersOverTime,
      };
    } catch (error) {
      this.logger.error('Error fetching user analytics', error);
      throw error;
    }
  }
}
