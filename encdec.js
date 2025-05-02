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

const encrypted = encrypt(`{
  "product_id": 2,
  "qty": 4
}`);


const decrypted = decrypt(`f7c448ea191861b183bc830c6a482ea7ed9d08d231682a16e0ea2c50fd0c500cbc75987ebf32c903c012548fb96fae3c30b05ab014badbdbd563cf62534e725f`);

console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);