export interface Station {
  id: number;
  nanoid?: string;
  name: string;
  country: string;
  genre?: string;
  type?: string;
  streamUrl: string;
  favicon?: string;
  logo?: string;
  local_image_url?: string; // Our processed/managed image URL
  homepage?: string;
  
  // Geographic coordinates
  latitude?: number;
  longitude?: number;
  city?: string;
  
  // Custom metadata API settings
  metadataApiUrl?: string;
  metadataApiType?: string;
  metadataFormat?: string;
  metadataFields?: string;
  
  // Extended station information
  description?: string;
  language?: string;
  frequency?: string;
  establishedYear?: number;
  owner?: string;
  bitrate?: number;
  codec?: string;
  
  // Social media links
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  
  // Contact information
  email?: string;
  phone?: string;
  address?: string;
  
  // Schedule and programming
  schedule?: string; // JSON string with program schedule
  programs?: string; // JSON string with show information
  
  // Additional metadata
  tags?: string;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
}