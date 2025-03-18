import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'


createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register('/assets/project_estimation/task-ui/sw.js', { scope: '/assets/project_estimation/task-ui/' })
      .then(reg => console.log('Service Worker registered with scope:', reg.scope))
      .catch(error => console.error('Service Worker registration failed:', error));
    });
  }
 
