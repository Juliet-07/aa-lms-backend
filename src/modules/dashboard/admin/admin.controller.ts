import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { CurrentUser } from '../../../common/decorators';
import { User } from '../../schemas';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  // ─────────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('dashboard/stats')
  @ApiOperation({
    summary: 'Dashboard statistics',
    description: 'Returns aggregate counts: total learners, completion rate, and total number of issued certificates.',
  })
  async getDashboardStats(@CurrentUser() user: User) {
    return this.adminService.getDashboardStats(user._id.toString());
  }

  @Get('dashboard/recent-learners')
  @ApiExcludeEndpoint()
  async getRecentLearners(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getRecentLearners(user._id.toString(), limit || 5);
  }

  @Get('dashboard/top-modules')
  @ApiOperation({
    summary: 'Top Modules Statitics',
    description: 'Shows results for modules and rate of engagement.',
  })
  async getTopPerformingModules(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getTopPerformingModules(
      user._id.toString(),
      limit || 3,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('users')
  @ApiOperation({
    summary: 'List all learners',
    description:
      'Returns all registered learner accounts with their profile data and course progress summary. ' +
      'Does not include admin accounts.',
  })
  async getAllUsers(@CurrentUser() user: User) {
    return this.adminService.getAllUsers(user._id.toString());
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('analytics')
  async getUserAnalytics(@CurrentUser() user: User) {
    return this.adminService.getUserAnalytics(user._id.toString());
  }

  @Get('modules/statistics')
  @ApiExcludeEndpoint()
  async getModuleStatistics(@CurrentUser() user: User) {
    return this.adminService.getModuleStatistics(user._id.toString());
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REFLECTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('reflections')
  @ApiOperation({
    summary: 'List all reflection submissions',
    description:
      'Returns every reflection submitted by all learners, with user details populated. ' +
      'Supports optional filtering by module and date range.',
  })
  @ApiQuery({ name: 'moduleId', required: false, type: String })
  @ApiQuery({ name: 'segmentId', required: false, type: String })
  // @ApiQuery({ name: 'startDate', required: false, type: String })
  // @ApiQuery({ name: 'endDate', required: false, type: String })
  async getAllReflections(
    @CurrentUser() user: User,
    @Query('moduleId') moduleId?: string,
    @Query('segmentId') segmentId?: string,
    // @Query('startDate') startDate?: string,
    // @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (moduleId) {
      filters.moduleId = parseInt(moduleId);
    }

    if (segmentId) {
      filters.segmentId = parseInt(segmentId);
    }

    // if (startDate) {
    //   filters.startDate = new Date(startDate);
    // }

    // if (endDate) {
    //   filters.endDate = new Date(endDate);
    // }

    return this.adminService.getAllReflections(user._id.toString(), filters);
  }

  @Get('reflections/module/:moduleId')
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
  async getReflectionsByUser(
    @CurrentUser() user: User,
    @Query('userId') userId: string,
  ) {
    return this.adminService.getReflectionsByUser(user._id.toString(), userId);
  }

  @Get('reflections/stats')
  @ApiOperation({
    summary: 'Reflection submission statistics',
    description:
      'Returns aggregate counts: total submissions, unique users, and breakdown by module.',
  })
  async getReflectionStats(@CurrentUser() user: User) {
    return this.adminService.getReflectionStats(user._id.toString());
  }

  @Get('reflections/export')
  @ApiExcludeEndpoint()
  async exportReflections(
    @CurrentUser() user: User,
    @Query('moduleId') moduleId?: string,
  ) {
    return this.adminService.exportReflections(
      user._id.toString(),
      moduleId ? parseInt(moduleId) : undefined,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCENARIOS
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('scenarios')
  @ApiOperation({
    summary: 'List all scenario submissions',
    description:
      'Returns every scenario response submitted by all learners, with user details populated. ' +
      'Supports optional filtering by module and date range.',
  })
  @ApiQuery({ name: 'moduleId', required: false, type: String })
  // @ApiQuery({ name: 'segmentId', required: false, type: String })
  async getAllScenarios(
    @CurrentUser() user: User,
    @Query('moduleId') moduleId?: string,
    // @Query('startDate') startDate?: string,
    // @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getAllScenarios(user._id.toString(), {
      moduleId: moduleId ? Number(moduleId) : undefined,
      // startDate: startDate ? new Date(startDate) : undefined,
      // endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('scenarios/stats')
  @ApiOperation({
    summary: 'Scenario submission statistics',
    description:
      'Returns aggregate counts: total submissions, unique users, and breakdown by module.',
  })
  async getScenarioStats(@CurrentUser() user: User) {
    return this.adminService.getScenarioStats(user._id.toString());
  }
}
