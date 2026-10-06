// Writes frames/qr.svg: a real QR code for the placeholder join URL, drawn as one path in currentColor.
const QRCode = require('qrcode');
const fs = require('fs');
const url = process.argv[2] || 'https://flavor-playbook.vercel.app/j/TB1109';
const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
const n = qr.modules.size, d = qr.modules.data;
let path = '';
for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (d[y * n + x]) path += `M${x} ${y}h1v1h-1z`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges"><path fill="currentColor" d="${path}"/></svg>`;
fs.writeFileSync(__dirname + '/../frames/qr.svg', svg);
console.log('modules', n, 'url', url);
