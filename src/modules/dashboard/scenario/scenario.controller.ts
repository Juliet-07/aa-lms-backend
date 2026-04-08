import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ScenarioService, SubmitScenarioDto } from './scenario.service';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/modules/schemas';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Learners - Scenarios')
@Controller('scenarios')
@UseGuards(JwtAuthGuard)
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit or update a scenario response',
    description:
      "Saves a learner's written response to a scenario activity. " +
      'Upserts based on userId + moduleId + segmentId. ' +
      'Response is validated for quality and relevance before saving.',
  })
  async submitScenario(
    @CurrentUser() user: User,
    @Body() dto: SubmitScenarioDto,
  ) {
    return this.scenarioService.submitScenario(user._id.toString(), dto);
  }

  @Get('by-segment')
  @ApiOperation({
    summary: 'Get my scenario response for a specific segment',
    description:
      "Returns the current user's saved response for the given module + segment. Used to pre-populate the scenario form on revisit.",
  })
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
  @ApiOperation({
    summary: 'Get all my scenario submissions',
    description:
      'Returns every scenario submission by the authenticated learner, sorted newest first.',
  })
  async getMyScenarios(@CurrentUser() user: User) {
    return this.scenarioService.getUserScenarios(user._id.toString());
  }
}
