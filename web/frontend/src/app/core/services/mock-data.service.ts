import { inject, Injectable } from '@angular/core';
import { I_DisplayableData } from '../interfaces/displayable-interface';


let test_displayed_data: I_DisplayableData = {
  stat_name: "tweet_likes-mean",
  owners: ["alabama_cs"],
  type: "stat-value",
  values: [1]

}

let test_displayed_data2: I_DisplayableData = {
  stat_name: "tweet_likes-sum",
  owners: ["alabama_cs"],
  type: "stat-trend",
  values: [10]

}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  public overrideProfile = false;
  constructor() { 
  }


  getMockData(): I_DisplayableData[] {
    return [test_displayed_data, test_displayed_data2];
  }


}
