import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class InsertShoutoutDto {
  @ApiProperty({
    description: 'Timestamp ("ts" field on slack message objects returned from "/by-timeframe" endpoint) of the shoutout to insert to database',
    example: '1663168188.802909',
    required: true,
  })
  @IsNumberString()
  shoutoutTimestamp: string;
};