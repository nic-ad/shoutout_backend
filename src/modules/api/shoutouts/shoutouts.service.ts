import { Injectable } from '@nestjs/common';
import { Message } from 'src/modules/database/message/message.entity';
import { LATEST_SHOUTOUTS_LIMIT } from '../constants';
import { HelperService } from '../helper.service';

@Injectable()
export class ShoutoutsService {
  constructor(private helperService: HelperService) {}

  async latestShoutouts(): Promise<Message[]> {
    const shoutouts = await this.helperService.getShoutouts()
      .orderBy('shoutout.createDate', 'DESC')
      .limit(LATEST_SHOUTOUTS_LIMIT)
      .getMany();

    await this.helperService.postProcessShoutouts(shoutouts);

    return shoutouts;
  }

  async shoutoutsByYear(year: string): Promise<Message[]> {
    const requestedYear = Number(year);
    let shoutouts;

    if (requestedYear) {
      shoutouts = await this.helperService.getShoutouts()
        .where('EXTRACT(YEAR from shoutout.createDate) = :requestedYear', {
          requestedYear,
        })
        .getMany();
    } else {
      const now = new Date();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(now.getMonth() - 12);

      shoutouts = await this.helperService.getShoutouts()
        .where('shoutout.createDate >= :twelveMonthsAgo', { twelveMonthsAgo })
        .getMany();
    }

    await this.helperService.postProcessShoutouts(shoutouts);

    return shoutouts;
  }
}
