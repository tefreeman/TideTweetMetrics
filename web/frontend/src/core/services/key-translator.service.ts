import { Injectable } from '@angular/core';
import { I_KeyTranslator } from '../interfaces/key-translator-interface';

@Injectable({
  providedIn: 'root'
})
export class KeyTranslatorService {

  // TODO: ISSUE: improve the translation object to sound more natural
  private _translationObject: I_KeyTranslator = {
    "mean": { full: "Average of all", abr: "Avg", desc: "Mean value", order: 1 },
    "std": { full: "Standard Deviation of all", abr: "SD", desc: "Standard Deviation value", order: 1 },
    "min": { full: "Minimum of all", abr: "Min", desc: "Minimum value", order: 1 },
    "max": { full: "Maximum of all", abr: "Max", desc: "Maximum value", order: 1 },
    "count": { full: "Count of all", abr: "Count", desc: "Count value", order: 1 },
    "sum": { full: "Sum of all", abr: "Sum", desc: "Sum value, order: 1", order: 1 },
    "median": { full: "Median of all", abr: "Med", desc: "Median value", order: 1 },
    "25th_percentile": { full: "25th Percentile of all", abr: "25th", desc: "25th Percentile value", order: 1 },
    "75th_percentile": { full: "75th Percentile of all", abr: "75th", desc: "75th Percentile value", order: 1 },
    "pearson": { full: "Pearson Correlation Coefficient of", abr: "PCC", desc: "Pearson Correlation Coefficient of two stats; used globally", order: 1 },
    "tweet_likes": { full: "likes", abr: "TLike", desc: "Number of Likes on a given Tweet", order: 2 },
    "tweet_retweets": { full: "retweets", abr: "TRet", desc: "Number of Retweets of a given Tweet", order: 2 },
    "tweet_replies": { full: "replies", abr: "TRep", desc: "Number of Replies on a given Tweet", order: 2 },
    "tweet_quotes": { full: "quotes", abr: "TQuote", desc: "Number of Quotes in a given Tweet", order: 2 },
    "tweet_hashtags": { full: "hashtags", abr: "THash", desc: "Number of Hashtags in a given Tweet", order: 2 },
    "tweet_cashtags": { full: "cashtags", abr: "TCash", desc: "Number of Cashtags in a given Tweet", order: 2 },
    "tweet_mentions": { full: "mentions", abr: "TMent", desc: "Number of Mentions in a given Tweet", order: 2 },
    "tweet_urls": { full: "URLs", abr: "TUrl", desc: "Number of URLs in a given Tweet", order: 2 },
    "tweet_photos": { full: "photos", abr: "TPhoto", desc: "Number of Photos in a given Tweet", order: 2 },
    "tweet_videos": { full: "videos", abr: "TVid", desc: "Number of Videos in a given Tweet", order: 2 },
    "tweet_cards": { full: "cards", abr: "TCard", desc: "Number of Cards in a given Tweet", order: 2 },
    "tweet_referenced_tweets": { full: "Referenced Tweets", abr: "TRT", desc: "Number of Referenced Tweets in a given Tweet", order: 2 },
    "tweet_count": { full: "'Count' counts", abr: "TCount", desc: "Number of 'counts' in a given Tweet", order: 2 },
    "tweet_chars": { full: "characters", abr: "TChar", desc: "Number of characters in a given Tweet", order: 2 },
    "tweet_words": { full: "words", abr: "TWord", desc: "Number of words in a given Tweet", order: 2 },
    "tweet_annotations": { full: "annotations", abr: "TAnn", desc: "Number of annotations in a given Tweet", order: 2 },
    "post_date_day": { full: "post Date values", abr: "PDt", desc: "What day of the week the Tweet was posted (0=Mon, 1=Tues... 6=Sun)", order: 2 },
    "post_date_hour": { full: "post Hour values", abr: "PHr", desc: "What hour of the day the Tweet was posted (0=12am, 1=1am... 23=11pm)", order: 2 },
    "likes_per_follower": { full: "Total Likes per Follower ratio", abr: "LPF", desc: "Sum of Tweet Likes divided by Total followers, for a given profile", order: 1 },
  };

  private _translationFixes: I_KeyTranslator = {
    "tweet_count-sum": { full: "Tweet Count", abr: "TC", desc: "Tweet Count value", order: 1 },

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

    let keys = this.splitKey(key);
    keys.sort((a, b) => this._translationObject[a]?.order - this._translationObject[b]?.order);
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
