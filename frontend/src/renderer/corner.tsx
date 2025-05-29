import { createRoot } from 'react-dom/client';

import { Corner } from './pages';

const corner = document.getElementById('croot') as HTMLElement;
if (corner) {
  const root = createRoot(corner);
  root.render(<Corner />);
}
