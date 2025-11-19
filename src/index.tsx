import React from 'react-dom';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (root) {
  React.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
