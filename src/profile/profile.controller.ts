import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService){}

  @Get('search')
  @ApiOperation({ summary: 'Searches for people given name or email and returns their user info' })
  @ApiQuery({ name: 'email', required: false, description: 'partial or full email address of a person' })
  @ApiQuery({ name: 'name', required: false, description: 'partial or full name of a person' })
  @ApiBadRequestResponse( { description: 'Bad Request (Valid \'name\' or \'email\' Param Required)'} )
  @ApiUnauthorizedResponse({ description: 'Unauthorized'} )
  @ApiInternalServerErrorResponse( { description: 'Unexpected Error'} )
  getProfilesBySearch(@Query('email') email: string, @Query('name') name: string){
    //profileService.profilesBySearch()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns information about a person including shoutouts given and received' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized'} )
  @ApiNotFoundResponse( { description: 'Profile not found'} )
  @ApiInternalServerErrorResponse( { description: 'Unexpected Error'} )
  getProfileById(@Param('id') id: string){
    //profileService.profileById()
  }
}
