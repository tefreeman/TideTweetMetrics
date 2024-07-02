export interface TweetPayload {
  text: string;
  author_id: string;
  created_at: string;
  mentions: string[];
  photo_count: number;
  video_count: number;
}
