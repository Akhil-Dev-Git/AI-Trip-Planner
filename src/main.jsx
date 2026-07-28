import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.onerror = function (message, source, lineno, colno, error) {
  const errText = `JS Error: ${message} at ${source}:${lineno}:${colno}`;
  console.error(errText);
  fetch('http://127.0.0.1:5001/api/log_error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: errText, stack: error ? error.stack : '' })
  }).catch(() => {});
};

window.addEventListener('unhandledrejection', function (event) {
  const errText = `Unhandled Promise Rejection: ${event.reason}`;
  console.error(errText);
  fetch('http://127.0.0.1:5001/api/log_error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: errText, stack: event.reason && event.reason.stack ? event.reason.stack : '' })
  }).catch(() => {});
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
