import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ScenarioService, SubmitScenarioDto } from './scenario.service';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/modules/schemas';

@Controller('scenarios')
@UseGuards(JwtAuthGuard)
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @Post()
  async submitScenario(
    @CurrentUser() user: User,
    @Body() dto: SubmitScenarioDto,
  ) {
    return this.scenarioService.submitScenario(user._id.toString(), dto);
  }

  @Get('by-segment')
  async getBySegment(
    @CurrentUser() user: User,
    @Query('moduleId') moduleId: string,
    @Query('segmentId') segmentId: string,
  ) {
    return this.scenarioService.getScenarioBySegment(
      user._id.toString(),
      Number(moduleId),
      Number(segmentId),
    );
  }

  @Get('my')
  async getMyScenarios(@CurrentUser() user: User) {
    return this.scenarioService.getUserScenarios(user._id.toString());
  }
}
