import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress, ProgressDocument } from '../../../schemas';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class ModuleStatisticsService {
  constructor(
    @InjectModel(Progress.name)
    private readonly progressModel: Model<ProgressDocument>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ModuleStatisticsService.name);
  }

  private readonly moduleDefinitions = [
    {
      moduleId: 1,
      title: 'Understanding the Foundations of PPPR and CLM',
      description:
        'Introducing global and African PPR systems and CLM as a mechanism for accountability, justice, and participation',
      parts: 21,
    },
    {
      moduleId: 2,
      title: 'The Principles and Practice of CLM',
      description:
        'Deep dive into community engagement methods, data collection, and accountability mechanisms',
      parts: 20,
    },
    {
      moduleId: 3,
      title: 'Integrating CLM into PPPR Frameworks',
      description:
        'Practical frameworks and strategies for bringing communities and health systems together',
      parts: 17,
    },
    {
      moduleId: 4,
      title: 'Action, Advocacy and Sustainability',
      description:
        'Building lasting change through strategic advocacy, policy influence, and institutional partnerships',
      parts: 14,
    },
  ];

  async getTopPerformingModules(limit: number = 3) {
    try {
      const allProgress = await this.progressModel.find().lean();

      const moduleStats = this.moduleDefinitions.map((modDef) => {
        const moduleData = {
          moduleId: modDef.moduleId,
          title: modDef.title,
          totalParts: modDef.parts,
          totalUsers: allProgress.length,
          completedCount: 0,
          inProgressCount: 0,
          totalProgress: 0,
          totalScore: 0,
          scoredCount: 0,
        };

        allProgress.forEach((progress) => {
          const module = progress.modules.find(
            (m) => m.moduleId === modDef.moduleId,
          );

          if (module) {
            moduleData.totalProgress += module.progress || 0;

            if (module.status === 'completed') {
              moduleData.completedCount++;
            } else if (module.status === 'in-progress') {
              moduleData.inProgressCount++;
            }

            if (module.assessmentScore !== null) {
              moduleData.totalScore += module.assessmentScore;
              moduleData.scoredCount++;
            }
          }
        });

        const completionRate =
          moduleData.totalUsers > 0
            ? Math.round((moduleData.completedCount / moduleData.totalUsers) * 100)
            : 0;

        const averageScore =
          moduleData.scoredCount > 0
            ? Math.round(moduleData.totalScore / moduleData.scoredCount)
            : 0;

        let type = 'mixed';
        if (modDef.moduleId === 1) type = 'text';
        if (modDef.moduleId === 2) type = 'video';
        if (modDef.moduleId === 4) type = 'quiz';

        return {
          moduleId: modDef.moduleId,
          title: modDef.title,
          duration: modDef.parts * 5,
          type,
          completionRate,
          averageScore,
          completedCount: moduleData.completedCount,
          inProgressCount: moduleData.inProgressCount,
        };
      });

      return moduleStats
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, limit);
    } catch (error) {
      this.logger.error('Error fetching top performing modules', error);
      throw error;
    }
  }

  async getModuleStatistics() {
    try {
      const allProgress = await this.progressModel.find().lean();

      return this.moduleDefinitions.map((modDef) => {
        const stats = {
          completed: 0,
          inProgress: 0,
          locked: 0,
          notStarted: 0,
          totalAttempts: 0,
          passedAssessment: 0,
          failedAssessment: 0,
          averageScore: 0,
          averageProgress: 0,
          scores: [],
        };

        allProgress.forEach((progress) => {
          const module = progress.modules.find(
            (m) => m.moduleId === modDef.moduleId,
          );

          if (module) {
            if (module.status === 'completed') stats.completed++;
            else if (module.status === 'in-progress') stats.inProgress++;
            else if (module.status === 'locked') stats.locked++;

            stats.averageProgress += module.progress || 0;

            if (module.assessmentAttempts > 0) {
              stats.totalAttempts += module.assessmentAttempts;
              if (module.assessmentPassed) stats.passedAssessment++;
              else stats.failedAssessment++;

              if (module.assessmentScore !== null) {
                stats.scores.push(module.assessmentScore);
              }
            }
          }
        });

        const totalUsers = allProgress.length;
        stats.notStarted =
          totalUsers - (stats.completed + stats.inProgress + stats.locked);
        stats.averageProgress =
          totalUsers > 0 ? Math.round(stats.averageProgress / totalUsers) : 0;
        stats.averageScore =
          stats.scores.length > 0
            ? Math.round(
                stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length,
              )
            : 0;

        return {
          ...modDef,
          statistics: stats,
        };
      });
    } catch (error) {
      this.logger.error('Error fetching module statistics', error);
      throw error;
    }
  }

  async getModuleCompletionStats() {
    try {
      return await this.progressModel.aggregate([
        { $unwind: '$modules' },
        {
          $group: {
            _id: '$modules.moduleId',
            completed: {
              $sum: {
                $cond: [{ $eq: ['$modules.status', 'completed'] }, 1, 0],
              },
            },
            inProgress: {
              $sum: {
                $cond: [{ $eq: ['$modules.status', 'in-progress'] }, 1, 0],
              },
            },
            locked: {
              $sum: {
                $cond: [{ $eq: ['$modules.status', 'locked'] }, 1, 0],
              },
            },
            averageProgress: { $avg: '$modules.progress' },
            averageScore: { $avg: '$modules.assessmentScore' },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    } catch (error) {
      this.logger.error('Error fetching module completion stats', error);
      throw error;
    }
  }
}