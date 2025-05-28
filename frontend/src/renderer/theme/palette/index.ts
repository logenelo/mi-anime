export const allPalette = await Promise.all([
  import('./Bocchi').then((module) => ({ name: 'Bocchi', value: 'Bocchi', ...module })),
  import('./Shojo').then((module) => ({ name: '少女', value: 'Shojo', ...module })),
  import('./Cyberpunk').then((module) => ({ name: '賽博朋克', value: 'Cyberpunk', ...module })),
  import('./Shonen').then((module) => ({ name: '少年', value: 'Shonen', ...module })),
  import('./Life').then((module) => ({ name: '日常', value: 'Life', ...module })),
  import('./Mecha').then((module) => ({ name: '機甲', value: 'Mecha', ...module })),
  import('./Isekai').then((module) => ({ name: '異世界', value: 'Isekai', ...module })),
]);

const palette = allPalette.reduce((acc: Record<string, any>, palette: any) => {
  acc[palette.value] = palette;
  return acc;
}, {});

export default palette
