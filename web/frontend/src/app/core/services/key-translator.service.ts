import { Injectable } from '@angular/core';
import { I_KeyTranslator } from '../interfaces/key-translator-interface';

@Injectable({
  providedIn: 'root'
})
export class KeyTranslatorService {

  // TODO: ISSUE: improve the translation object to sound more natural
  private _translationObject: I_KeyTranslator = {
    "mean": {full: "Average", abr: "Avg", desc: "Mean value", order: 1},
    "std": {full: "Standard Deviation", abr: "SD", desc: "Standard Deviation value", order: 1},
    "min": {full: "Minimum", abr: "Min", desc: "Minimum value", order: 1},
    "max": {full: "Maximum", abr: "Max", desc: "Maximum value", order: 1},
    "count": {full: "Count", abr: "C", desc: "Count value", order: 1},
    "sum": {full: "Sum", abr: "S", desc: "Sum value, order: 1", order: 1},
    "median": {full: "Median", abr: "Med", desc: "Median value", order: 1},
    "25th_percentile": {full: "25th Percentile", abr: "25th", desc: "25th Percentile value", order: 1},
    "75th_percentile": {full: "75th Percentile", abr: "75th", desc: "75th Percentile value", order: 1},
    "PCC": {full: "Pearson Correlation Coefficient", abr: "PCC", desc: "Pearson Correlation Coefficient value", order: 1},
    "tweet_likes": {full: "Tweet Likes", abr: "TL", desc: "Tweet Likes value", order: 1},
    "tweet_retweets": {full: "Tweet Retweets", abr: "TR", desc: "Tweet Retweets value", order: 1},
    "tweet_replies": {full: "Tweet Replies", abr: "TRe", desc: "Tweet Replies value", order: 1},
    "tweet_quotes": {full: "Tweet Quotes", abr: "TQ", desc: "Tweet Quotes value", order: 1},
    "tweet_hashtags": {full: "Tweet Hashtags", abr: "TH", desc: "Tweet Hashtags value", order: 1},
    "tweet_cashtags": {full: "Tweet Cashtags", abr: "TC", desc: "Tweet Cashtags value", order: 1},
    "tweet_mentions": {full: "Tweet Mentions", abr: "TM", desc: "Tweet Mentions value", order: 1},
    "tweet_urls": {full: "Tweet URLs", abr: "TU", desc: "Tweet URLs value", order: 1},
    "tweet_photos": {full: "Tweet Photos", abr: "TP", desc: "Tweet Photos value", order: 1},
    "tweet_videos": {full: "Tweet Videos", abr: "TV", desc: "Tweet Videos value", order: 1},
    "tweet_cards": {full: "Tweet Cards", abr: "TC", desc: "Tweet Cards value", order: 1},
    "tweet_referenced_tweets": {full: "Tweet Referenced Tweets", abr: "TRT", desc: "Tweet Referenced Tweets value", order: 1},
    "tweet_count": {full: "Tweet Count", abr: "TC", desc: "Tweet Count value", order: 1},
    "tweet_chars": {full: "Tweet Characters", abr: "TC", desc: "Tweet Characters value", order: 1},
    "tweet_words": {full: "Tweet Words", abr: "TW", desc: "Tweet Words value", order: 1},
    "tweet_annotations": {full: "Tweet Annotations", abr: "TA", desc: "Tweet Annotations value", order: 1},
    
  };

  private _translationFixes: I_KeyTranslator = {
    "tweet_count-sum": {full: "Tweet Count", abr: "TC", desc: "Tweet Count value", order: 1},

  }

  constructor() {

  }

  public setTranslationObject(translationObject: I_KeyTranslator): void {
      this._translationObject = translationObject;
  }

    splitKey(key: string): string[] {
        return key.split("-");
    }

  private translateKeySingle(key: string): string {
    return this._translationObject[key]?.full ?? key;
  }

  translateKey(key: string): string {
    if (this._translationFixes[key]) {
        return this._translationFixes[key].full;
    }
    
    const keys = this.splitKey(key);
    return keys.map(k => this.translateKeySingle(k)).join(" ");
  }

  hasAbr(key: string): boolean {
      return !!this._translationObject[key]?.abr;
  }

  hasDesc(key: string): boolean {
      return !!this._translationObject[key]?.desc;
  }

  translateKeyAbr(key: string): string {
      return this._translationObject[key]?.abr ?? key;
  }

  translateKeyDesc(key: string): string {
      return this._translationObject[key]?.desc ?? key;
  }

}
