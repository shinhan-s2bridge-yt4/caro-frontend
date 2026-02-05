// utils/number.ts
export const formatNumberWithComma = (value?: string | number) => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' && value.trim() === '') return '';

  const number =
    typeof value === 'string'
      ? Number(value.replace(/,/g, ''))
      : value;

  if (isNaN(number)) return String(value);

  return number.toLocaleString();
};
