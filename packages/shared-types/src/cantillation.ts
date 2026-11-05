/**
 * Domain definitions for Hebrew Cantillation (טעמי המקרא) - Moroccan Tradition
 */

export enum CantillationCategory {
  MAFSIK = 'MAFSIK',       // טעם מפסיק
  MESHART = 'MESHART',     // טעם משרת
}

export enum MoroccanTraditionSubstyle {
  GENERAL = 'MOROCCAN_GENERAL',       // נוסח מרוקאי כללי
  CASABLANCA = 'MOROCCAN_CASABLANCA', // נוסח קזבלנקה
  MEKNES = 'MOROCCAN_MEKNES',         // נוסח מקנס ("ירושלים של מרוקו")
  MARRAKECH = 'MOROCCAN_MARRAKECH',   // נוסח מרקש
  FES = 'MOROCCAN_FES',               // נוסח פאס
}

export enum BiblicalSection {
  TORAH = 'TORAH',                   // קריאת התורה
  HAFTARAH = 'HAFTARAH',             // הפטרה
  MEGILLAT_ESTHER = 'MEGILLAT_ESTHER', // מגילת אסתר (נוסח מרוקאי ייחודי)
  PASSOVER_HAGGADAH = 'PASSOVER_HAGGADAH', // קריאות ייחודיות לפסח
}

export interface TaamDefinition {
  id: string;
  nameHebrew: string;         // e.g. "זַרְקָא", "סֶגּוֹל", "רְבִיעִי"
  nameEnglish: string;        // e.g. "Zarqa", "Segol", "Revii"
  category: CantillationCategory;
  unicodeSymbol: string;      // Unicode mark (U+0591 to U+05AF)
  unicodeHex: string;         // e.g. "U+0598"
  descriptionHebrew: string;  // תיאור הטעם ואופן הנגינה במסורת מרוקו
  orderIndex: number;
}

export interface CantorReference {
  id: string;
  nameHebrew: string;
  tradition: MoroccanTraditionSubstyle;
  bioHebrew?: string;
  avatarUrl?: string;
}

/**
 * Ensures strict Unicode Normalization Form C (NFC) for Hebrew text
 * combining Consonants, Niqqud, and Cantillation marks (U+0591 - U+05AF).
 */
export function normalizeHebrewText(text: string): string {
  if (!text) return '';
  return text.normalize('NFC');
}

/**
 * Checks if a character falls within the Hebrew Cantillation Unicode block
 */
export function isCantillationMark(char: string): boolean {
  if (!char || char.length === 0) return false;
  const code = char.charCodeAt(0);
  return code >= 0x0591 && code <= 0x05af;
}
