import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReflectionService, SubmitReflectionDto } from './reflection.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../schemas';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Learners - Reflections')
@Controller('reflections')
@UseGuards(AuthGuard('jwt'))
export class ReflectionController {
  constructor(private readonly reflectionService: ReflectionService) {}

  // Submit a reflection
  @Post()
  @ApiOperation({
    summary: 'Submit or update a reflection',
    description:
      "Saves a learner's responses to a reflection activity. " +
      'If the learner has already submitted for this module + segment, the record is **updated** (upsert). ' +
      'All responses are validated for quality and relevance before saving — ' +
      'short, gibberish, or off-topic answers return **400**.',
  })
  async submitReflection(
    @CurrentUser() user: User,
    @Body() dto: SubmitReflectionDto,
  ) {
    return this.reflectionService.submitReflection(user._id.toString(), dto);
  }

  // Get current reflections of the user
  @Get('my-reflections')
  @ApiOperation({
    summary: 'Get all my reflection submissions',
    description:
      'Returns every reflection submitted by the authenticated learner, sorted newest first.',
  })
  async getMyReflections(@CurrentUser() user: User) {
    return this.reflectionService.getUserReflections(user._id.toString());
  }

  @Get('by-segment')
  @ApiExcludeEndpoint()
  async getReflectionBySegment(
    @Req() req: any,
    @Query('moduleId') moduleId: string,
    @Query('segmentId') segmentId: string,
  ) {
    const userId = req.user._id;
    const reflection = await this.reflectionService.getReflectionBySegment(
      userId,
      Number(moduleId),
      Number(segmentId),
    );

    return reflection;
  }

  // Admin: Get all reflections with filters
  // @Get('all')
  // async getAllReflections(
  //   @Query('moduleId') moduleId?: string,
  //   @Query('startDate') startDate?: string,
  //   @Query('endDate') endDate?: string,
  // ) {
  //   const filters: any = {};

  //   if (moduleId) {
  //     filters.moduleId = parseInt(moduleId);
  //   }
  //   if (startDate) {
  //     filters.startDate = new Date(startDate);
  //   }
  //   if (endDate) {
  //     filters.endDate = new Date(endDate);
  //   }

  //   return this.reflectionService.getAllReflections(filters);
  // }

  // Admin: Get reflections by module
  // @Get('module/:moduleId')
  // async getModuleReflections(@Param('moduleId') moduleId: string) {
  //   return this.reflectionService.getModuleReflections(parseInt(moduleId));
  // }

  // Admin: Get reflection statistics
  // @Get('stats')
  // async getStats() {
  //   return this.reflectionService.getReflectionStats();
  // }

  // Admin: Export reflections
  // @Get('export')
  // async exportReflections(@Query('moduleId') moduleId?: string) {
  //   return this.reflectionService.exportReflections(
  //     moduleId ? parseInt(moduleId) : undefined,
  //   );
  // }
}
