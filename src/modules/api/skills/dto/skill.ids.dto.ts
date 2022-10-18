import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SkillIdsDto {
  @ApiProperty({
    description: 'Ids of skills',
    example: ['1', '12', '15'],
  })
  @IsString({ each: true })
  ids: string[];
}
