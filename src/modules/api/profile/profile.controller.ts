import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  INTERNAL_SERVER_ERROR,
  PROFILE,
  PROFILE_ID_NOT_FOUND,
  PROFILE_SEARCH_BAD_REQUEST,
  UNAUTHORIZED,
} from 'src/modules/api/constants';
import { DEFAULT_JWT } from 'src/modules/auth/constants';

import { BasicProfileDto, FullProfileDto } from './dto/profile.dto';
import { ProfileService } from './profile.service';

@ApiTags(PROFILE)
@ApiBearerAuth()
@UseGuards(AuthGuard(DEFAULT_JWT))
@Controller(PROFILE)
@ApiUnauthorizedResponse({ description: UNAUTHORIZED })
@ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Searches for people given name and/or email and returns their basic profile info',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'partial or full email address of a person',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'partial or full name of a person',
  })
  @ApiOkResponse({ type: [BasicProfileDto] })
  @ApiBadRequestResponse({
    description: `Bad Request (${PROFILE_SEARCH_BAD_REQUEST})`,
  })
  getProfilesBySearch(
    @Query('email') email: string,
    @Query('name') name: string,
  ): Promise<BasicProfileDto[]> {
    return this.profileService.profilesBySearch({ email, name });
  }

  @Get('all-with-skills')
  getProfilesWithSkills(): Promise<FullProfileDto[]> {
    return this.profileService.profilesWithSkills();
  }

  //TODO: REMOVE
  @Get(':id')
  @ApiOperation({
    summary:
      'Returns full profile info for given id including shoutouts the person has given and received',
  })
  @ApiOkResponse({ type: FullProfileDto })
  @ApiNotFoundResponse({ description: PROFILE_ID_NOT_FOUND })
  getProfileById(@Param('id') id: string) {
    return this.profileService.profileById(id);
  }
}
