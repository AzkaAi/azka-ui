import React from 'react';

const P = {
  // brand
  spark: '<path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/>',
  // header / ui
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  cornerDown: '<path d="M9 10l-5 5 5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>',
  // card types
  brain: '<path d="M12 5a3 3 0 0 0-5.9.6A2.5 2.5 0 0 0 4 8a2.5 2.5 0 0 0 .5 4.5A2.5 2.5 0 0 0 7 17a2.5 2.5 0 0 0 5 .5z"/><path d="M12 5a3 3 0 0 1 5.9.6A2.5 2.5 0 0 1 20 8a2.5 2.5 0 0 1-.5 4.5A2.5 2.5 0 0 1 17 17a2.5 2.5 0 0 1-5 .5z"/><path d="M12 5v14"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/>',
  filePen: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6"/><path d="M14 2v6h6"/><path d="M18.5 14.5a1.5 1.5 0 0 1 2 2L16 21l-3 1 1-3z"/>',
  terminal: '<path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M7 9l3 3-3 3M13 15h4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  fileOut: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6M9 15l3-3 3 3"/>',
  braces: '<path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1"/><path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1"/>',
  refresh: '<path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>',
  helpCircle: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  gitBranch: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 8.5v7M18 10.5a6 6 0 0 1-6 6H6"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  party: '<path d="M4 20l5-14 9 9-14 5z"/><path d="M14 6l1-3M18 8l3-1M16 12l3 0M11 4l0-2"/>',
  alertTri: '<path d="M12 3l9.5 16.5H2.5z"/><path d="M12 9v5M12 17h.01"/>',
  // right panel
  folderTree: '<path d="M3 5a1 1 0 0 1 1-1h4l2 2h9a1 1 0 0 1 1 1v3"/><path d="M3 5v11a2 2 0 0 0 2 2h2"/><circle cx="16" cy="16" r="2"/><circle cx="16" cy="21" r="0"/><path d="M14 16H9v-3"/>',
  files: '<path d="M15 2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6z"/><path d="M15 2v4h4"/>',
  package: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>',
  sitemap: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2"/>',
  gauge: '<path d="M12 14l4-4"/><circle cx="12" cy="12" r="9"/><path d="M12 7v.01M7 12h.01M17 12h.01"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
  folder: '<path d="M3 7a1 1 0 0 1 1-1h4l2 2h9a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1z"/>',
  folderOpen: '<path d="M3 7a1 1 0 0 1 1-1h4l2 2h8a1 1 0 0 1 1 1H6a2 2 0 0 0-1.9 1.4L3 16z"/><path d="M3 16l1.5-5.6A2 2 0 0 1 6 9h14a1 1 0 0 1 1 1.3l-1.6 5.4A2 2 0 0 1 17.5 17H4a1 1 0 0 1-1-1z"/>',
  fileCode: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M10 13l-2 2 2 2M14 13l2 2-2 2"/>',
  download: '<path d="M12 3v12M7 11l5 4 5-4"/><path d="M5 20h14"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 4.2a6 6 0 0 1 0 11.6"/><path d="M7 9h4M9 7v4"/>',
  dollar: '<path d="M12 2v20M17 6.5C17 4.5 14.8 3.5 12 3.5S7 4.6 7 7s2.5 3 5 3.5 5 1.2 5 3.5-2.2 3.5-5 3.5-5-1-5-3"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6M12 5V2"/>',
  layers: '<path d="M12 2l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  boxes: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  activity: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  rotateCw: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  expand: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 16M14.5 12.5L20 18M8.1 8L12 12"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.5"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13a1 1 0 0 1 .9.6L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l2.6-6.4A1 1 0 0 1 5.5 5z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  volume: '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M16 9a4 4 0 0 1 0 6M19 7a8 8 0 0 1 0 10"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  pause: '<rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/>',
};

export function Icon({ name, size, stroke, className, style }) {
  const d = P[name];
  return React.createElement('svg', {
    viewBox: '0 0 24 24', width: size, height: size, className, style,
    fill: 'none', stroke: 'currentColor',
    strokeWidth: stroke || 2, strokeLinecap: 'round', strokeLinejoin: 'round',
    dangerouslySetInnerHTML: { __html: d || '' },
  });
}
