export function formatPointNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

export function formatPointTotal(value: number): string {
  return `${formatPointNumber(value)} P`;
}

export function formatPointDelta(value: number): string {
  return `${value >= 0 ? '+ ' : '- '}${formatPointNumber(Math.abs(value))} P`;
}
