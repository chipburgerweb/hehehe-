export type SkyMood = 'cerulean' | 'twilight' | 'aurora';

export type MemoryCategory = 'Momen Favorit' | 'Petualangan' | 'Lucu';

export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  location: string;
  story: string;
  category: MemoryCategory;
  imageDataUrl: string | null;
  featured?: boolean;
}

export interface ConstellationStar {
  id: string;
  label: string;
  title: string;
  message: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface WishLantern {
  id: string;
  wish: string;
  createdAt: string;
  xOffset: number;
}

export interface BirthdayConfig {
  siteBrand: string;
  recipientName: string;
  recipientNickname: string;
  senderName: string;
  birthdayDate: string; // YYYY-MM-DD
  turningAge: number;
  skyMood: SkyMood;
  heroTitle: string;
  heroSubtitle: string;
  heroPhotoDataUrl: string | null;
  heroPhotoCaption: string;
  letterHeading: string;
  letterBody: string;
  letterClosing: string;
  letterPhotoDataUrl: string | null;
  letterPhotoCaption: string;
  secretConstellationTitle: string;
  secretConstellationMessage: string;
  toothlessQuotes: string[];
  memories: MemoryItem[];
  constellationStars: ConstellationStar[];
  wishLanterns: WishLantern[];
}

export const NIGHT_FURY_ASSETS = {
  fullBody: '/assets/aistudio/Toothless_full_body_render_3c0a9104.webp',
  upsideDown: '/assets/aistudio/night_fury_PNG115949_d0761c5d.png',
  sittingCute: '/assets/aistudio/115535-night-fury_ba1e093e.png',
  blueCrouch: '/assets/aistudio/night_fury_PNG115943_ac12d108.png',
  auroraWings: '/assets/aistudio/dlcleev-2d1b4ec3-bd5a-432e-9330-c5219d93a01a_bf9ad252.png',
  peekingSmile: '/assets/aistudio/115496-night-fury_8c3c2d04.png',
} as const;
