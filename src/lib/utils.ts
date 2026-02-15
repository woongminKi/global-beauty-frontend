import type { LocalizedString } from './api';

export type Locale = 'en' | 'ja' | 'zh';

export function getLocalizedText(text: LocalizedString, locale: Locale): string {
  return text[locale] || text.en;
}

export function formatDate(date: string | Date, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    ja: 'ja-JP',
    zh: 'zh-CN',
  };

  return d.toLocaleDateString(localeMap[locale], options);
}

export function formatCurrency(
  amount: number,
  currency: string = 'KRW',
  locale: Locale = 'en'
): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    ja: 'ja-JP',
    zh: 'zh-CN',
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const tagLabels: Record<string, Record<Locale, string>> = {
  'plastic-surgery': { en: 'Plastic Surgery', ja: '美容整形', zh: '整形外科' },
  dermatology: { en: 'Dermatology', ja: '皮膚科', zh: '皮肤科' },
  'skin-care': { en: 'Skin Care', ja: 'スキンケア', zh: '护肤' },
  laser: { en: 'Laser', ja: 'レーザー', zh: '激光' },
  'english-speaking': { en: 'English', ja: '英語対応', zh: '英语服务' },
  'japanese-speaking': { en: 'Japanese', ja: '日本語対応', zh: '日语服务' },
  'chinese-speaking': { en: 'Chinese', ja: '中国語対応', zh: '中文服务' },
  'foreigner-friendly': { en: 'Foreigner Friendly', ja: '外国人歓迎', zh: '外国人友好' },
  'weekend-available': { en: 'Weekend Available', ja: '週末可', zh: '周末可预约' },
  'vip-service': { en: 'VIP Service', ja: 'VIPサービス', zh: 'VIP服务' },
  nose: { en: 'Rhinoplasty', ja: '鼻整形', zh: '隆鼻' },
  eyes: { en: 'Eye Surgery', ja: '目の整形', zh: '眼部整形' },
  facial: { en: 'Facial', ja: 'フェイシャル', zh: '面部护理' },
  'body-contouring': { en: 'Body Contouring', ja: 'ボディライン', zh: '体型雕塑' },
  breast: { en: 'Breast Surgery', ja: '豊胸', zh: '隆胸' },
  liposuction: { en: 'Liposuction', ja: '脂肪吸引', zh: '抽脂' },
  acne: { en: 'Acne Treatment', ja: 'ニキビ治療', zh: '痤疮治疗' },
  'anti-aging': { en: 'Anti-Aging', ja: 'アンチエイジング', zh: '抗衰老' },
  affordable: { en: 'Affordable', ja: 'リーズナブル', zh: '经济实惠' },
  international: { en: 'International', ja: 'インターナショナル', zh: '国际化' },
};

export function getTagLabel(tag: string, locale: Locale): string {
  return tagLabels[tag]?.[locale] || tag;
}

export const statusLabels: Record<string, Record<Locale, string>> = {
  received: { en: 'Received', ja: '受付済', zh: '已收到' },
  contactingHospital: { en: 'Contacting Hospital', ja: '病院確認中', zh: '联系医院中' },
  proposedOptions: { en: 'Options Proposed', ja: '提案中', zh: '已提供选项' },
  confirmed: { en: 'Confirmed', ja: '確定', zh: '已确认' },
  cancelled: { en: 'Cancelled', ja: 'キャンセル', zh: '已取消' },
  needsMoreInfo: { en: 'Needs More Info', ja: '追加情報必要', zh: '需要更多信息' },
  noAvailability: { en: 'No Availability', ja: '空きなし', zh: '无空位' },
};

export function getStatusLabel(status: string, locale: Locale): string {
  return statusLabels[status]?.[locale] || status;
}

export const statusColors: Record<string, string> = {
  received: 'bg-blue-100 text-blue-800',
  contactingHospital: 'bg-yellow-100 text-yellow-800',
  proposedOptions: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  needsMoreInfo: 'bg-orange-100 text-orange-800',
  noAvailability: 'bg-red-100 text-red-800',
};
