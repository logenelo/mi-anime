import { createRoot } from 'react-dom/client';
import App from './App';
// import { initDB } from 'react-indexed-db-hook';
// import { DBConfig } from './DBConfig';
// initDB(DBConfig);

const container = document.getElementById('root') as HTMLElement;

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
// calling IPC exposed from preload script
// window.electron.ipcRenderer.once('ipc-example', (arg) => {
//   // eslint-disable-next-line no-console
//   console.log(arg);
// });
// window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
