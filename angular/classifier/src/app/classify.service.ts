import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom, map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ClassifyService {

  constructor(private http: HttpClient) {}


  get_random_tweet() : Promise<any>{
    return firstValueFrom(this.http.get<any>("http://73.58.28.154:8000/metrics/get_random_tweet"));
  }

  set_random_tweet(tweetId: string, uid: string, result: string): Promise<any> {
    return firstValueFrom(this.http.get<any>("http://73.58.28.154:8000/metrics/set_random_tweet/" + tweetId +"/" + uid + "/" + result));
  }
}
