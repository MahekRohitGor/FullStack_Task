const crypto = require("crypto");
const algorithm = 'AES-256-CBC';
const key = Buffer.from("4fa3c5b6f6a8318be1e0f1e342a1c2a9569f85f74f4dbf37e70ac925ca78e147", 'hex');
const iv = Buffer.from("15a8f725eab7c3d34cc4e1a6e8aa1f9a", 'hex');

const bcrypt = require('bcrypt');

const plain = 'adminstrong1234';
const hash = '$2b$10$5YLSt3NhTskAhfsVAcx89Ozx67ZJoEN9HKkWOOa.Ex9b/.hQ.FmTa';

const match = bcrypt.compareSync(plain, hash);
// const enc = bcrypt.hashSync(plain, 10)
console.log('Match:', match);

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
//   "email_id": "admin@example.com",
//   "password_": "adminstrong1234"
// }`);

const encrypted = encrypt(`{"search":"Sam","category":[4],"max_price":5000000,"page":1}
`);


const decrypted = decrypt(`f7c448ea191861b183bc830c6a482ea702082e3ce94c58685c3ba892dfe9a18143246bda5fd6202a314aa5cd57522889ad484f6cddb8018935515cc87bbf8842`);

console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);