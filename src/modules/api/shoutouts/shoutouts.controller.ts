import {
  BadRequestException,
  Body,
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DEFAULT_JWT, RESTRICTED_JWT } from 'src/modules/auth/constants';

import {
  API_RESTRICTED,
  INTERNAL_SERVER_ERROR,
  SHOUTOUTS,
  TIMEFRAME_SHOUTOUTS_BAD_REQUEST,
  UNAUTHORIZED,
} from '../constants';
import { InsertShoutoutDto } from './dto/insert.shoutout.dto';
import { ShoutoutDto } from './dto/shoutout.dto';
import { TimeframeShoutoutsDto } from './dto/timeframe.shoutouts.dto';
import { ShoutoutsService } from './shoutouts.service';

const TimeframeQuery = createParamDecorator(async (dtoClass: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const dto = plainToInstance(dtoClass, request.query, { excludeExtraneousValues: true });
  const errors = await validate(dto);

  if (errors.length) {
    throw new BadRequestException(TIMEFRAME_SHOUTOUTS_BAD_REQUEST);
  }

  return dto;
});

@ApiBearerAuth()
@Controller('shoutouts')
@ApiUnauthorizedResponse({ description: UNAUTHORIZED })
@ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
export class ShoutoutsController {
  constructor(private readonly shoutoutsService: ShoutoutsService) {}

  @Get('latest')
  @UseGuards(AuthGuard(DEFAULT_JWT))
  @ApiTags(SHOUTOUTS)
  @ApiOperation({ summary: 'Returns the 10 most recent shoutouts' })
  @ApiOkResponse({ type: [ShoutoutDto] })
  async getLatest(): Promise<ShoutoutDto[]> {
    return this.shoutoutsService.latestShoutouts();
  }

  @Get('by-year')
  @UseGuards(AuthGuard(DEFAULT_JWT))
  @ApiTags(SHOUTOUTS)
  @ApiOperation({
    summary:
      'Returns all shoutouts for the given year (YYYY format) or past 12 months if no valid year given',
  })
  @ApiQuery({ name: 'year', required: false })
  @ApiOkResponse({ type: [ShoutoutDto] })
  async getByYear(@Query('year') year: string): Promise<ShoutoutDto[]> {
    return this.shoutoutsService.shoutoutsByYear(year);
  }

  @Get('by-timeframe')
  @UseGuards(AuthGuard(RESTRICTED_JWT))
  @ApiTags(API_RESTRICTED)
  @ApiOperation({
    summary: `Fetches shoutouts with Slack\'s conversations.history API (https://api.slack.com/methods/conversations.history)`,
  })
  @ApiQuery({ type: TimeframeShoutoutsDto })
  @ApiOkResponse({ description: 'Messages (and metadata) returned for the given timeframe' })
  @ApiBadRequestResponse()
  async getByTimeframe(
    @TimeframeQuery(TimeframeShoutoutsDto) timeframeShoutoutsDto: TimeframeShoutoutsDto,
  ): Promise<any> {
    return this.shoutoutsService.shoutoutsByTimeframe(timeframeShoutoutsDto);
  }

  @Post('insert')
  @UseGuards(AuthGuard(RESTRICTED_JWT))
  @ApiTags(API_RESTRICTED)
  @ApiOperation({ summary: 'Inserts shoutout with the given timestamp into database' })
  @ApiBody({ type: InsertShoutoutDto })
  @ApiCreatedResponse({ description: 'Shoutout Successfully Inserted' })
  @ApiBadRequestResponse()
  async insertShoutout(@Body() insertShoutoutDto: InsertShoutoutDto): Promise<any> {
    return this.shoutoutsService.insertShoutoutAtTimestamp(insertShoutoutDto.shoutoutTimestamp);
  }
}
