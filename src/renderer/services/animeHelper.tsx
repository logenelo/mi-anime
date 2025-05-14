export const getWeekdayLabel = (day: number) => {
  const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'] as const;
  return WEEKDAY_NAMES[day];
};
