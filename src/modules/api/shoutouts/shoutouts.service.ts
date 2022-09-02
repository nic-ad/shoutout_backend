import { Injectable } from '@nestjs/common';

import { LATEST_SHOUTOUTS_LIMIT } from '../constants';
import { HelperService } from '../helper.service';
import { ShoutoutDto } from './dto/shoutout.dto';

@Injectable()
export class ShoutoutsService {
  constructor(private helperService: HelperService) {}

  async latestShoutouts(): Promise<ShoutoutDto[]> {
    const shoutouts: ShoutoutDto[] = await this.helperService
      .getShoutouts()
      .orderBy('shoutout.createDate', 'DESC')
      .limit(LATEST_SHOUTOUTS_LIMIT)
      .getMany();

    await this.helperService.postProcessShoutouts(shoutouts);

    return shoutouts;
  }

  async shoutoutsByYear(year: string): Promise<ShoutoutDto[]> {
    const requestedYear = Number(year);
    let shoutouts: ShoutoutDto[];

    if (requestedYear) {
      shoutouts = await this.helperService
        .getShoutouts()
        .where('EXTRACT(YEAR from shoutout.createDate) = :requestedYear', {
          requestedYear,
        })
        .getMany();
    } else {
      const now = new Date();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(now.getMonth() - 12);

      shoutouts = await this.helperService
        .getShoutouts()
        .where('shoutout.createDate >= :twelveMonthsAgo', { twelveMonthsAgo })
        .getMany();
    }

    await this.helperService.postProcessShoutouts(shoutouts);

    return shoutouts;
  }
}
