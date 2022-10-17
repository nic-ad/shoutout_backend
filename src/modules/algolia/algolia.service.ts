import { Injectable } from '@nestjs/common';
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';

@Injectable()
export class AlgoliaService {
  private client: SearchClient;
  private userIndex: SearchIndex;

  constructor() {
    this.client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_API_KEY);
    this.userIndex = this.client.initIndex(process.env.ALGOLIA_INDEX_NAME);
  }

  async indexUser(user: Record<string, unknown>) {
    return this.userIndex.saveObject(user);
  }

  async updateUser(partialUser: Record<string, unknown>) {
    return this.userIndex.partialUpdateObject(partialUser);
  }

  async getUser(id: string) {
    return this.userIndex.getObject(id);
  }

  async modifyIndex(id: string, user: Record<string, unknown>) {
    // will need to test the responses on this
    try {
      await this.getUser(id);

      // if this returns a user then
      // UPDATE
      this.updateUser({
        objectID: id,
        ...user,
      });

      // else if no record exists
      // CREATE
      this.indexUser({
        objectID: id,
        ...user,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
