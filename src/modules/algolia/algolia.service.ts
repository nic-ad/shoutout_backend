import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AlgoliaService {
  private client: SearchClient;
  private userIndex: SearchIndex;

  constructor() {
    this.client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_API_KEY);
    this.userIndex = this.client.initIndex(process.env.ALGOLIA_INDEX_NAME);
  }

  async indexUser(id: string, user: Record<string, unknown>) {
    return this.userIndex.saveObject({ objectID: id, ...user });
  }

  async updateUser(id: string, partialUser: Record<string, unknown>) {
    return this.userIndex.partialUpdateObject({
      objectID: id,
      ...partialUser,
    });
  }
}
