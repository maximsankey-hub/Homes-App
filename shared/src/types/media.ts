import type { MediaType } from '../enums.js';

export interface Media {
  id: string;
  propertyId: string;
  roomId: string | null;
  type: MediaType;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}
