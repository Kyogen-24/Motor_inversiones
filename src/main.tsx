import React from 'react';
import { createRoot } from 'react-dom/client';
import './presentation/styles.css';
import App from './presentation/App';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
