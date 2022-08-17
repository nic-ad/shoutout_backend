import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PROFILE_ID_NOT_FOUND, PROFILE_SEARCH_BAD_REQUEST } from 'src/modules/api/constants';
import { ProfileService } from './profile.service';
import { BasicProfileDto, FullProfileDto } from './dto/profile.dto';

@ApiTags('profile')
@Controller('profile')
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
  //@ApiUnauthorizedResponse({ description: 'Unauthorized'} )
  @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
  getProfilesBySearch(
    @Query('email') email: string,
    @Query('name') name: string,
  ): Promise<BasicProfileDto[]> {
    return this.profileService.profilesBySearch({ email, name });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Returns full profile info for given id including shoutouts the person has given and received',
  })
  @ApiOkResponse({ type: FullProfileDto })
  //@ApiUnauthorizedResponse({ description: 'Unauthorized'} )
  @ApiNotFoundResponse({ description: PROFILE_ID_NOT_FOUND })
  @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
  getProfileById(@Param('id') id: string) {
    return this.profileService.profileById(id);
  }
}