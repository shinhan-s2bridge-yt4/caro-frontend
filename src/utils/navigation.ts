export type NavigationTab = 'home' | 'car' | 'coin' | 'store' | 'user';

export function getTabRoute(tab: NavigationTab): string {
  return tab === 'home'
    ? '/home'
    : tab === 'car'
      ? '/car'
      : tab === 'coin'
        ? '/coin'
        : tab === 'store'
          ? '/store'
          : '/user';
}
