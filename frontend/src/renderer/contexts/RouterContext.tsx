import React from 'react';
const RouterContext = React.createContext<{
  route: string;
  navigate: (path: string) => void;
}>({} as any);

export default RouterContext;
