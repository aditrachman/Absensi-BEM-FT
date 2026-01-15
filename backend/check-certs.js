const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'server.key');
const certPath = path.join(__dirname, 'server.crt');

console.log('__dirname:', __dirname);
console.log('keyPath:', keyPath);
console.log('certPath:', certPath);

console.log('Key exists:', fs.existsSync(keyPath));
console.log('Cert exists:', fs.existsSync(certPath));

try {
    const https = require('https');
    console.log('HTTPS module loaded');
} catch (e) {
    console.log('HTTPS module error:', e.message);
}
