import { getApiBaseUrl } from '@/utils/api';

const FALLBACK_REWARD_IMAGE_BASE_URL = 'https://api.caro.today';

export function toRewardImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const baseUrl = getApiBaseUrl() || FALLBACK_REWARD_IMAGE_BASE_URL;
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${normalizedPath}`;
}
