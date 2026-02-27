export type UserMenuKey =
  | 'my-car'
  | 'settings'
  | 'notification'
  | 'privacy'
  | 'support'
  | 'terms'
  | 'logout';

export const USER_MENU_ITEMS: ReadonlyArray<{ key: UserMenuKey; label: string }> = [
  { key: 'my-car', label: '내 차 정보' },
  { key: 'settings', label: '설정' },
  { key: 'notification', label: '알림 설정' },
  { key: 'privacy', label: '개인정보 보호' },
  { key: 'support', label: '도움말 및 지원' },
  { key: 'terms', label: '이용약관' },
  { key: 'logout', label: '로그아웃' },
];
