// src/modules/progress/progress.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../schemas';

@Controller('progress')
@UseGuards(AuthGuard('jwt'))
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getProgress(@CurrentUser() user: User) {
    return this.progressService.getOrCreateProgress(user._id.toString());
  }

  @Post('start')
  async startCourse(@CurrentUser() user: User) {
    return this.progressService.startCourse(user._id.toString());
  }

  @Put('module/:moduleId')
  async updateModuleProgress(
    @CurrentUser() user: User,
    @Param('moduleId') moduleId: number,
    @Body() body: { progress: number },
  ) {
    return this.progressService.updateModuleProgress(
      user._id.toString(),
      Number(moduleId),
      body.progress,
    );
  }

  @Put('module/:moduleId/part/:partId')
  async updatePartCompletion(
    @CurrentUser() user: User,
    @Param('moduleId') moduleId: number,
    @Param('partId') partId: number,
    @Body() body: { completed: boolean },
  ) {
    return this.progressService.updatePartCompletion(
      user._id.toString(),
      Number(moduleId),
      Number(partId),
      body.completed,
    );
  }
}
