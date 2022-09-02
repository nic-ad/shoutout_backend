import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from '../constants';
import { ShoutoutDto } from './dto/shoutout.dto';
import { ShoutoutsService } from './shoutouts.service';

@ApiTags('shoutouts')
@Controller('shoutouts')
export class ShoutoutsController {
  constructor(private readonly shoutoutsService: ShoutoutsService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Returns the 10 most recent shoutouts' })
  @ApiOkResponse({ type: [ShoutoutDto] })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  async getLatest(): Promise<ShoutoutDto[]> {
    return this.shoutoutsService.latestShoutouts();
  }

  @Get('by-year')
  @ApiOperation({
    summary:
      'Returns all shoutouts for the given year (YYYY format) or past 12 months if no valid year given',
  })
  @ApiQuery({ name: 'year', required: false })
  @ApiOkResponse({ type: [ShoutoutDto] })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  async getByYear(@Query('year') year: string): Promise<ShoutoutDto[]> {
    return this.shoutoutsService.shoutoutsByYear(year);
  }
}
