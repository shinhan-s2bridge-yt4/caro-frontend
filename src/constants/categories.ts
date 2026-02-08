// constants/categories.ts
export const CATEGORIES = [
  { key: 'ALL', label: '전체' },
  { key: 'FUEL', label: '주유비' },
  { key: 'REPAIR', label: '정비·수리비' },
  { key: 'PARKING', label: '주차비' },
  { key: 'TOLL', label: '통행료' },
  { key: 'CAR_WASH', label: '세차비' },
  { key: 'INSURANCE', label: '보험료' },
  { key: 'ACCESSORY', label: '자동차 용품비' },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];
