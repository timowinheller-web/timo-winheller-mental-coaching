// Verschlüsselt eine fertige HTML-Seite (stdin) mit dem Passwort aus SITE_PASSWORD.
// PBKDF2-SHA256 (200.000 Runden, Salt als Hex-Argument) -> AES-256-GCM. Ausgabe: base64(iv + ciphertext + tag).
// Gegenstück: js/gate.js (WebCrypto im Browser).
const crypto = require('crypto');
const saltHex = process.argv[2];
const pw = process.env.SITE_PASSWORD || '';
if (!saltHex || !pw) { console.error('Salt und SITE_PASSWORD nötig'); process.exit(1); }
let html = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => { html += d; });
process.stdin.on('end', () => {
  const key = crypto.pbkdf2Sync(pw.normalize('NFC'), Buffer.from(saltHex, 'hex'), 200000, 32, 'sha256');
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(html, 'utf8'), c.final()]);
  process.stdout.write(Buffer.concat([iv, ct, c.getAuthTag()]).toString('base64'));
});
