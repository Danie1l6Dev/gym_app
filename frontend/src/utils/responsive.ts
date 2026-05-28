import { DIMENSIONS } from '@/constants';

export function getContentWidth() {
  return Math.min(DIMENSIONS.screenWidth - 32, DIMENSIONS.contentMaxWidth);
}

