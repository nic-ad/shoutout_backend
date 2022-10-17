import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { INTERNAL_SERVER_ERROR, SKILLS, UNAUTHORIZED } from 'src/modules/api/constants';
import { DEFAULT_JWT } from 'src/modules/auth/constants';
import { UpdateResult } from 'typeorm';

import { BasicProfileDto } from '../profile/dto/profile.dto';
import { SkillsService } from './skills.service';

@ApiTags(SKILLS)
@ApiBearerAuth()
@UseGuards(AuthGuard(DEFAULT_JWT))
@Controller(SKILLS)
@ApiUnauthorizedResponse({ description: UNAUTHORIZED })
@ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Patch('update')
  @ApiOperation({
    summary: 'Updates profile with skill ids corresponding to skills a person has (see "skills" table)',
  })
  @ApiBody({ type: BasicProfileDto })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  updateSkills(@Body() profileDto: BasicProfileDto): Promise<UpdateResult> {
    return this.skillsService.updateSkills(profileDto);
  }
}
