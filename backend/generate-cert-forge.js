const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

console.log('Generating certificates using node-forge...');

const pki = forge.pki;
const keys = pki.rsa.generateKeyPair(2048);
const cert = pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'commonName',
  value: 'localhost'
}, {
  name: 'countryName',
  value: 'ID'
}, {
  shortName: 'ST',
  value: 'Jakarta'
}, {
  name: 'organizationName',
  value: 'Absensi BEM'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey);

const pem = {
  private: pki.privateKeyToPem(keys.privateKey),
  cert: pki.certificateToPem(cert)
};

const keyPath = path.join(__dirname, 'server.key');
const certPath = path.join(__dirname, 'server.crt');

fs.writeFileSync(keyPath, pem.private);
fs.writeFileSync(certPath, pem.cert);

console.log('✅ Certificates generated successfully!');
console.log('Key path:', keyPath);
console.log('Cert path:', certPath);
