const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

console.log('Generating certificates...');
const attrs = [{ name: 'commonName', value: 'localhost' }];
try {
    const pems = selfsigned.generate(attrs, { days: 365 });
    
    const keyPath = path.join(__dirname, 'server.key');
    const certPath = path.join(__dirname, 'server.crt');

    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);

    console.log('✅ Certificates generated successfully!');
    console.log('Key path:', keyPath);
    console.log('Cert path:', certPath);
    
    // Verify immediate existence
    if (fs.existsSync(keyPath)) {
        console.log('Verified: Key file exists.');
    } else {
        console.error('ERROR: Key file NOT found after write!');
    }
} catch (error) {
    console.error('Generation failed:', error);
}
