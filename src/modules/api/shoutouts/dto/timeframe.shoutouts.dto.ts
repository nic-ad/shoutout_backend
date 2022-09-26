import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumberString, IsOptional } from 'class-validator';

export class TimeframeShoutoutsDto {
  @ApiProperty({
    description:
      'Only messages after this Unix timestamp will be included in results (default is 0)',
    example: '1657209690.925999',
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  @Expose()
  oldest?: string;

  @ApiProperty({
    description:
      'Only messages before this Unix timestamp will be included in results (default is current time)',
    example: '1663189167.355109',
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  @Expose()
  latest?: string;

  @ApiProperty({
    description: `The maximum number of items to return. Fewer than the requested number of items may be returned, 
      even if the end of the list hasn't been reached (default 100)`,
    example: '10',
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  @Expose()
  limit?: number;
}
