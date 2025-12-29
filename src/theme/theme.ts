import { forestDark, forestLight } from '@/theme/schemes/forest';
import { girlyPopDark, girlyPopLight } from '@/theme/schemes/girly-pop';
import { minimalDark, minimalLight } from '@/theme/schemes/minimal';
import { Theme } from '@/theme/types';

// Theme resolver function
export function getTheme(
  scheme: 'minimal' | 'girly-pop' | 'forest',
  isDark: boolean
): Theme {
  if (scheme === 'girly-pop') {
    return isDark ? girlyPopDark : girlyPopLight;
  }
  if (scheme === 'forest') {
    return isDark ? forestDark : forestLight;
  }
  return isDark ? minimalDark : minimalLight;
}
