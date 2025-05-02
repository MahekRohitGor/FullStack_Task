const crypto = require("crypto");
const algorithm = 'AES-256-CBC';
const key = Buffer.from("4fa3c5b6f6a8318be1e0f1e342a1c2a9569f85f74f4dbf37e70ac925ca78e147", 'hex');
const iv = Buffer.from("15a8f725eab7c3d34cc4e1a6e8aa1f9a", 'hex');

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// const encrypted = encrypt(`{
//   "payment_type": "cod",
//   "address_id": 2
// }`);

const encrypted = encrypt(`{
  "page": 1,
  "search": "app",
  "max_price": 500000
}
`);


const decrypted = decrypt(`f7c448ea191861b183bc830c6a482ea70730c78bc59823e98b79cfb97ad90a2433506eb23db6f9afe95e7a41ea578870f9bfda4ee0a647ef5c61d6a30b117d85fe8e87e880997b3bb45d40a62f416ad861abdc086c9f8fcc4f21d35f0c112f7b05d854267d1127b077e5487a2d3a88f967159058579e93d0af107618534861ada05f2461c8079466ccf302ac500383cc9e4ef341bcc0fbb181b6ff22b126383f`);

console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);