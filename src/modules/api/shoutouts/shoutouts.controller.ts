import { Controller, Get, Query } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOperation, ApiProduces, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Message } from 'src/database/modules/message/message.entity';
import { ShoutoutsService } from './shoutouts.service';

@ApiTags('shoutouts')
@ApiProduces('application/json')
@Controller('shoutouts')
export class ShoutoutsController {
  constructor(private shoutoutsService: ShoutoutsService){}

  @Get('latest')
  @ApiOperation({ summary: 'Returns the 10 most recent shoutouts' })
  //@ApiUnauthorizedResponse({ description: 'Unauthorized'} )
  @ApiInternalServerErrorResponse( { description: 'Unexpected Error'} )
  async getLatest(): Promise<Message[]> {
    return this.shoutoutsService.latestShoutouts();
  }

  @Get('by-year')
  @ApiOperation({ summary: 'Returns all shoutouts for the given year (YYYY format) or past 12 months if no valid year given' })
  @ApiQuery({ name: 'year', required: false })
  //@ApiUnauthorizedResponse({ description: 'Unauthorized'} )
  @ApiInternalServerErrorResponse( { description: 'Unexpected Error'} )
  async getByYear(@Query('year') year: string): Promise<Message[]> {
    return this.shoutoutsService.shoutoutsByYear(year);
  }
}
