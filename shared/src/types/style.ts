export interface StylePhotoItem {
  id: string;
  roomType: string;
  styleName: string;
  imageUrl: string;
}

export interface StyleRoomProgress {
  roomType: string;
  totalPhotos: number;
  swipedCount: number;
  // Only set once there's a clear favorite among liked photos (see server aggregation) — a
  // household that hasn't swiped enough, or is genuinely split, gets null rather than a guess.
  topStyle: string | null;
}
