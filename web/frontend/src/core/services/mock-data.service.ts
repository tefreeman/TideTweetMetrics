import { inject, Injectable } from '@angular/core';
import { IDisplayableStats, I_DisplayableRequest } from '../interfaces/displayable-interface';


let test_displayed_data: I_DisplayableRequest = {
  stat_name: "tweet_likes-sum-yearly",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-trend",
}

let test_displayed_data1: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs", "msu_egr"]},
  type: "stat-comp",
}

let test_displayed_data4: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs", "msu_egr"]},
  type: "stat-comp",
}




let test_displayed_data2: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "top", owners: ["alabama_cs"], count: 25},
  type: "graph-bar",
}


let test_displayed_data3: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "all", owners: ["alabama_cs"], count: 5},
  type: "graph-line",
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  public overrideProfile = true;
  constructor() {
  }


  getMockData(): I_DisplayableRequest[] {
    return [test_displayed_data, test_displayed_data1, test_displayed_data2, test_displayed_data3,test_displayed_data4];
  }


}
