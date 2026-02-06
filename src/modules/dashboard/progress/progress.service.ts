import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress, ProgressDocument, User, UserDocument } from '../../schemas';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name)
    private readonly progressModel: Model<ProgressDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private readonly moduleDefinitions = [
    {
      moduleId: 1,
      title: 'Understanding the Foundations of PPR and CLM',
      description:
        'Introducing global and African PPR systems and CLM as a mechanism for accountability, justice, and participation',
      parts: 21,
    },
    {
      moduleId: 2,
      title: 'The Principles and Practice of CLM',
      description:
        'Deep dive into community engagement methods, data collection, and accountability mechanisms',
      parts: 18,
    },
    {
      moduleId: 3,
      title: 'Integrating CLM into PPR Frameworks',
      description:
        'Practical frameworks and strategies for bringing communities and health systems together',
      parts: 4,
    },
    {
      moduleId: 4,
      title: 'Action, Advocacy and Sustainability',
      description:
        'Building lasting change through strategic advocacy, policy influence, and institutional partnerships',
      parts: 4,
    },
  ];

  async getOrCreateProgress(userId: string): Promise<Progress> {
    let progress = await this.progressModel.findOne({ userId }).lean();

    if (!progress) {
      // Initialize progress with all modules locked
      const modules = this.moduleDefinitions.map((mod, index) => ({
        moduleId: mod.moduleId,
        title: mod.title,
        status: index === 0 ? 'in-progress' : 'locked',
        progress: 0,
        startedAt: null,
        completedAt: null,
        assessmentScore: null,
        assessmentPassed: false,
        assessmentAttempts: 0,
        lastAssessmentDate: null,
        parts: Array.from({ length: mod.parts }, (_, i) => ({
          partId: i + 1,
          title: `Part ${i + 1}`,
          completed: false,
          completedAt: null,
        })),
      }));

      progress = await this.progressModel.create({
        userId,
        overallProgress: 0,
        completedModules: 0,
        totalModules: 4,
        currentModuleId: 1,
        courseStartedAt: new Date(),
        lastAccessedAt: new Date(),
        averageScore: 0,
        certificateEarned: false,
        certificateIssuedAt: null,
        certificateId: null,
        modules,
      });
    }

    return progress;
  }

  async startCourse(userId: string): Promise<Progress> {
    let progress = await this.progressModel.findOne({ userId });

    if (!progress) {
      // Create new progress record with first module unlocked
      const modules = this.moduleDefinitions.map((mod, index) => ({
        moduleId: mod.moduleId,
        title: mod.title,
        status: index === 0 ? 'in-progress' : 'locked',
        progress: 0,
        startedAt: index === 0 ? new Date() : null,
        completedAt: null,
        assessmentScore: null,
        assessmentPassed: false,
        assessmentAttempts: 0,
        lastAssessmentDate: null,
        parts: Array.from({ length: mod.parts }, (_, i) => ({
          partId: i + 1,
          title: `Part ${i + 1}`,
          completed: false,
          completedAt: null,
        })),
      }));

      progress = await this.progressModel.create({
        userId,
        overallProgress: 0,
        completedModules: 0,
        totalModules: 4,
        currentModuleId: 1,
        courseStartedAt: new Date(),
        lastAccessedAt: new Date(),
        averageScore: 0,
        certificateEarned: false,
        certificateIssuedAt: null,
        certificateId: null,
        modules,
      });
    } else if (!progress.courseStartedAt) {
      // User exists but hasn't officially started
      progress.courseStartedAt = new Date();
      progress.lastAccessedAt = new Date();
      progress.modules[0].status = 'in-progress';
      progress.modules[0].startedAt = new Date();
      await progress.save();
    }

    return progress.toObject();
  }

  async updateModuleProgress(
    userId: string,
    moduleId: number,
    progress: number,
  ): Promise<Progress> {
    const userProgress = await this.progressModel.findOne({ userId });

    if (!userProgress) {
      throw new NotFoundException('Progress record not found');
    }

    const moduleIndex = userProgress.modules.findIndex(
      (m) => m.moduleId === moduleId,
    );

    if (moduleIndex === -1) {
      throw new NotFoundException('Module not found');
    }

    // Update module progress
    userProgress.modules[moduleIndex].progress = progress;

    // Set startedAt if not already set
    if (!userProgress.modules[moduleIndex].startedAt) {
      userProgress.modules[moduleIndex].startedAt = new Date();
    }

    // Mark as in-progress if it was locked
    if (userProgress.modules[moduleIndex].status === 'locked') {
      userProgress.modules[moduleIndex].status = 'in-progress';
    }

    // Mark as completed if progress is 100%
    if (progress >= 100) {
      userProgress.modules[moduleIndex].status = 'completed';
      userProgress.modules[moduleIndex].completedAt = new Date();
      userProgress.completedModules += 1;

      // Unlock next module
      if (moduleIndex + 1 < userProgress.modules.length) {
        userProgress.modules[moduleIndex + 1].status = 'in-progress';
        userProgress.currentModuleId = moduleIndex + 2;
      }
    }

    // Update overall progress
    const totalProgress = userProgress.modules.reduce(
      (sum, m) => sum + m.progress,
      0,
    );
    userProgress.overallProgress = Math.round(
      totalProgress / userProgress.modules.length,
    );

    userProgress.lastAccessedAt = new Date();

    await userProgress.save();
    return userProgress.toObject();
  }

  async updatePartCompletion(
    userId: string,
    moduleId: number,
    partId: number,
    completed: boolean,
  ): Promise<Progress> {
    const userProgress = await this.progressModel.findOne({ userId });

    if (!userProgress) {
      throw new NotFoundException('Progress record not found');
    }

    const module = userProgress.modules.find((m) => m.moduleId === moduleId);

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const part = module.parts.find((p) => p.partId === partId);

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    part.completed = completed;
    part.completedAt = completed ? new Date() : null;

    // Calculate module progress based on completed parts
    const completedParts = module.parts.filter((p) => p.completed).length;
    module.progress = Math.round((completedParts / module.parts.length) * 100);

    userProgress.lastAccessedAt = new Date();

    await userProgress.save();
    return userProgress.toObject();
  }

  // NEW: Submit assessment
  async submitAssessment(
    userId: string,
    moduleId: number,
    score: number,
    totalQuestions: number,
    correctAnswers: number,
  ): Promise<Progress> {
    const userProgress = await this.progressModel.findOne({ userId });

    if (!userProgress) {
      throw new NotFoundException('Progress record not found');
    }

    const moduleIndex = userProgress.modules.findIndex(
      (m) => m.moduleId === moduleId,
    );

    if (moduleIndex === -1) {
      throw new NotFoundException('Module not found');
    }

    const module = userProgress.modules[moduleIndex];

    // Check if all parts are completed (100% progress)
    if (module.progress < 100) {
      throw new BadRequestException(
        'Please complete all module content before taking the assessment',
      );
    }

    const passingScore = 70;
    const passed = score >= passingScore;

    // Update assessment data
    module.assessmentScore = score;
    module.assessmentPassed = passed;
    module.assessmentAttempts = (module.assessmentAttempts || 0) + 1;
    module.lastAssessmentDate = new Date();

    if (passed) {
      // Mark module as completed only if passed
      module.status = 'completed';
      module.completedAt = new Date();

      // Count completed modules
      const completedCount = userProgress.modules.filter(
        (m) => m.status === 'completed' && m.assessmentPassed,
      ).length;
      userProgress.completedModules = completedCount;

      // Unlock next module
      if (moduleIndex + 1 < userProgress.modules.length) {
        userProgress.modules[moduleIndex + 1].status = 'in-progress';
        userProgress.currentModuleId = moduleIndex + 2;
      }

      // Calculate average score across completed modules
      const completedModulesWithScores = userProgress.modules.filter(
        (m) => m.status === 'completed' && m.assessmentScore !== null,
      );

      if (completedModulesWithScores.length > 0) {
        const totalScore = completedModulesWithScores.reduce(
          (sum, m) => sum + m.assessmentScore,
          0,
        );
        userProgress.averageScore = Math.round(
          totalScore / completedModulesWithScores.length,
        );
      }

      // Check if all 4 modules are completed and issue certificate
      if (completedCount === 4) {
        await this.issueCertificate(userId, userProgress);
      }
    }

    // Update overall progress
    const totalProgress = userProgress.modules.reduce(
      (sum, m) => sum + m.progress,
      0,
    );
    userProgress.overallProgress = Math.round(
      totalProgress / userProgress.modules.length,
    );

    userProgress.lastAccessedAt = new Date();

    await userProgress.save();
    return userProgress.toObject();
  }

  // NEW: Issue certificate
  private async issueCertificate(
    userId: string,
    userProgress: ProgressDocument,
  ): Promise<void> {
    if (userProgress.certificateEarned) {
      return; // Certificate already issued
    }

    // Get user details
    const user = await this.userModel.findById(userId).lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate unique certificate ID
    const certificateId = this.generateCertificateId();

    // Update progress record with certificate info
    userProgress.certificateEarned = true;
    userProgress.certificateIssuedAt = new Date();
    userProgress.certificateId = certificateId;
  }

  // NEW: Generate unique certificate ID
  private generateCertificateId(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `KUJUA-${year}-${randomNum}`;
  }

  // NEW: Get certificate data
  async getCertificate(userId: string): Promise<any> {
    const progress = await this.progressModel.findOne({ userId }).lean();

    if (!progress) {
      throw new NotFoundException('Progress record not found');
    }

    if (!progress.certificateEarned) {
      throw new NotFoundException(
        'Certificate not available. Complete all 4 modules with 70% or above to earn your certificate.',
      );
    }

    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean();

    return {
      certificateId: progress.certificateId,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      finalScore: progress.averageScore,
      issuedAt: progress.certificateIssuedAt,
      moduleScores: progress.modules
        .filter((m) => m.status === 'completed')
        .map((m) => ({
          moduleId: m.moduleId,
          title: m.title,
          score: m.assessmentScore,
          completedAt: m.completedAt,
        })),
    };
  }

  async getProgress(userId: string): Promise<Progress> {
    const progress = await this.progressModel.findOne({ userId }).lean();

    if (!progress) {
      throw new NotFoundException('Progress record not found');
    }

    return progress;
  }
}
