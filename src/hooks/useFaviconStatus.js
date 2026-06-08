import { useEffect, useRef } from 'react';

let faviconInterval = null;

export function useFaviconStatus(status) {
  useEffect(() => {
    setFaviconStatus(status);
    
    return () => {
      if (faviconInterval) {
        clearInterval(faviconInterval);
        faviconInterval = null;
      }
    };
  }, [status]);
}

function setFaviconStatus(status) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  const colors = {
    active: '#22c55e',
    complete: '#3b82f6', 
    error: '#ef4444',
    idle: '#6b7280'
  };
  
  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, Math.PI * 2);
  ctx.fillStyle = colors[status] || colors.idle;
  ctx.fill();
  
  if (status === 'active') {
    // Pulsing dot — update every 500ms
    if (faviconInterval) {
      clearInterval(faviconInterval);
    }
    let bright = true;
    faviconInterval = setInterval(() => {
      ctx.clearRect(0, 0, 32, 32);
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fillStyle = bright ? '#22c55e' : '#15803d';
      ctx.fill();
      bright = !bright;
      updateFavicon(canvas);
    }, 500);
  } else {
    if (faviconInterval) {
      clearInterval(faviconInterval);
      faviconInterval = null;
    }
    updateFavicon(canvas);
  }
}

function updateFavicon(canvas) {
  const link = document.querySelector("link[rel='icon']") 
               || document.createElement('link');
  link.rel = 'icon';
  link.href = canvas.toDataURL();
  document.head.appendChild(link);
}
