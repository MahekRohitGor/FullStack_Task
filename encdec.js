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


const decrypted = decrypt(`bba2605cee9dbe496b1b6a1347a65c207cf3a704b4e513029406b56d4350dfbaefa81de8240e0dcf11a5566f558c9ad578f271b0cd161f7c5686654b9ad49e6517826f27283448e558f2c75d84ab81a72b8ff8662eb2eb640dc16cb2301276b7b5ae6e387b1c2131d180f190239cd8f52f940c8eb00acc79d0fa424ed29e4a3858016d8bab3446f169d24c386035e9f6`);

console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);