export type Layout = 'grid' | 'list';

export type ThemeMode = 'light' | 'dark';

export interface UserPreferences {
  theme: ThemeMode
  themeColor:string
  blurAmount: number;
  cardLayout: Layout;
}
