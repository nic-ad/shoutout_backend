import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

import { ShoutoutDto } from '../../shoutouts/dto/shoutout.dto';
import { SkillDto } from '../../skills/dto/skill.dto';

/*
 * User profile with shoutouts the person has given and received
 */
export class FullProfileDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  email: string;

  @ApiProperty({
    nullable: true,
    description: 'The DEPT® team this person is a part of',
    example: 'DPUS',
  })
  team: string;

  @ApiProperty({
    nullable: true,
    description: "Person's country of residence",
    example: 'US',
  })
  country: string;

  @ApiProperty({ nullable: true })
  name: string;

  @ApiProperty({
    nullable: true,
    description: 'Slack profile photo (small)',
  })
  image72: string;

  @ApiProperty({
    nullable: true,
    description: 'Slack profile photo (medium)',
  })
  image192: string;

  @ApiProperty({
    nullable: true,
    description: 'Slack profile photo (large)',
  })
  image512: string;

  @ApiProperty({
    type: () => [ShoutoutDto],
    description: 'List of shoutouts this person has authored',
  })
  shoutoutsGiven: ShoutoutDto[];

  @ApiProperty({
    type: () => [ShoutoutDto],
    description: 'List of shoutouts this person has been a recipient of',
  })
  shoutoutsReceived: ShoutoutDto[];

  @ApiProperty({
    nullable: true,
    description: 'List of skills this person has',
  })
  @IsArray()
  skills: SkillDto[];
}

/*
 * User profile without shoutouts the person has given and received
 */
export class BasicProfileDto extends OmitType(FullProfileDto, [
  'shoutoutsGiven',
  'shoutoutsReceived',
  'skills',
] as const) {}
