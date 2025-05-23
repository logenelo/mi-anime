export type Layout = 'grid' | 'list';

export interface UserPreferences {
  theme: 'light' | 'dark';
  blurAmount: number;
  cardLayout: Layout;
}
