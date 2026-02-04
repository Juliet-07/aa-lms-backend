import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReflectionService, SubmitReflectionDto } from './reflection.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../schemas';

@Controller('reflections')
@UseGuards(AuthGuard('jwt'))
export class ReflectionController {
  constructor(private readonly reflectionService: ReflectionService) {}

  // Submit a reflection
  @Post()
  async submitReflection(
    @CurrentUser() user: User,
    @Body() dto: SubmitReflectionDto,
  ) {
    return this.reflectionService.submitReflection(user._id.toString(), dto);
  }

  // Get current user's reflections
  @Get('my-reflections')
  async getMyReflections(@CurrentUser() user: User) {
    return this.reflectionService.getUserReflections(user._id.toString());
  }

  // Admin: Get all reflections with filters
  @Get('all')
  async getAllReflections(
    @Query('moduleId') moduleId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (moduleId) {
      filters.moduleId = parseInt(moduleId);
    }
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    return this.reflectionService.getAllReflections(filters);
  }

  // Admin: Get reflections by module
  @Get('module/:moduleId')
  async getModuleReflections(@Param('moduleId') moduleId: string) {
    return this.reflectionService.getModuleReflections(parseInt(moduleId));
  }

  // Admin: Get reflection statistics
  @Get('stats')
  async getStats() {
    return this.reflectionService.getReflectionStats();
  }

  // Admin: Export reflections
  @Get('export')
  async exportReflections(@Query('moduleId') moduleId?: string) {
    return this.reflectionService.exportReflections(
      moduleId ? parseInt(moduleId) : undefined,
    );
  }
}
