/* eslint-disable import/prefer-default-export */

export const WEEKDAY_NAMES = [
  '日',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
] as const;

export const getWeekdayLabel = (day: number) => {
  return WEEKDAY_NAMES[day];
};
