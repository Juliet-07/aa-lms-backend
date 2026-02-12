import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { CurrentUser } from '../../../common/decorators';
import { User } from '../../schemas';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  async getDashboardStats(@CurrentUser() user: User) {
    return this.adminService.getDashboardStats(user._id.toString());
  }

  @Get('dashboard/recent-learners')
  async getRecentLearners(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getRecentLearners(user._id.toString(), limit || 5);
  }

  @Get('users')
  async getAllUsers(@CurrentUser() user: User) {
    return this.adminService.getAllUsers(user._id.toString());
  }

  @Get('analytics')
  async getUserAnalytics(@CurrentUser() user: User) {
    return this.adminService.getUserAnalytics(user._id.toString());
  }

  @Get('modules/statistics')
  async getModuleStatistics(@CurrentUser() user: User) {
    return this.adminService.getModuleStatistics(user._id.toString());
  }

  @Get('dashboard/top-modules')
  async getTopPerformingModules(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getTopPerformingModules(
      user._id.toString(),
      limit || 3,
    );
  }

  @Get('reflections')
  async getAllReflections(
    @CurrentUser() user: User,
    @Query('moduleId') moduleId?: string,
    @Query('segmentId') segmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (moduleId) {
      filters.moduleId = parseInt(moduleId);
    }

    if (segmentId) {
      filters.segmentId = parseInt(segmentId);
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    return this.adminService.getAllReflections(user._id.toString(), filters);
  }

  @Get('reflections/module/:moduleId')
  async getReflectionsByModule(
    @CurrentUser() user: User,
    @Query('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.adminService.getReflectionsByModule(
      user._id.toString(),
      moduleId,
    );
  }

  @Get('reflections/user/:userId')
  async getReflectionsByUser(
    @CurrentUser() user: User,
    @Query('userId') userId: string,
  ) {
    return this.adminService.getReflectionsByUser(user._id.toString(), userId);
  }

  @Get('reflections/stats')
  async getReflectionStats(@CurrentUser() user: User) {
    return this.adminService.getReflectionStats(user._id.toString());
  }

  @Get('reflections/export')
  async exportReflections(
    @CurrentUser() user: User,
    @Query('moduleId') moduleId?: string,
  ) {
    return this.adminService.exportReflections(
      user._id.toString(),
      moduleId ? parseInt(moduleId) : undefined,
    );
  }
}
