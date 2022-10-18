import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SkillDto {
  @ApiProperty({
    description: 'Unique id of the skill',
    example: '3',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Name of the skill',
    example: 'vue',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of skill',
    example: 'language',
  })
  @IsString()
  type: string;
}
