import { Injectable } from '@angular/core';
import { I_DisplayableRequest } from '../interfaces/displayable-interface';
import { I_PageMap } from '../interfaces/pages-interface';

let test_displayed_data5: I_DisplayableRequest = {
  stat_name: 'tweet_likes-sum-yearly',
  ownersParams: { type: 'specific', owners: ['alabama_cs'] },
  type: 'stat-trend',
};

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  public overrideProfile = true;
  constructor() {}

  getMockData(): I_PageMap {
    return {
      home: {
        'dashboard-graph': {
          displayables: [],
          type: 'graph',
          order: 2,
        },

        'dashboard-card': {
          displayables: [test_displayed_data5],
          type: 'stat',
          order: 1,
        },
        // Add more mock data as needed for your use case
      },
    };
  }
}
