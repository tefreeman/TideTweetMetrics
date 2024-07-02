export interface TweetPayload {
  text: string;
  author_id: string;
  created_at: string;
  photo_count: number;
  video_count: number;
}

export interface TweetNode {
  tweet: TweetPayload;
  prediction: number;
  children: TweetNode[];
}
