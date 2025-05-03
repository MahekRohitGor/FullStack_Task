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

const encrypted = encrypt(`{
  "order_id": 1,
  "status": "processed"
}
`);


const decrypted = decrypt(`f7c448ea191861b183bc830c6a482ea74b460324b6bf5d72f404f5c74ba9c41be81d980aade87ad16dd45f73719fe2c02790ee65bd33394a0ea665405279006017005b62e33b21c866a85919c1a6d673362e8726bf6cf04bae0dcb0e8db210fc9798a8d68616ed45c639249d0b808601720793ac6bb16e2ee8c6fac1cc1a79f04680cca4a35f17e86b8a214a2c02607883aa6bc6f43c1e6148ab0035ae077c4363cd1c810c0e7355f63743e4f9c4ecb2a24e713b8c092051fb43138873851e6b53c33be6f0391d1471d0aced84b00d238336e71a004aac727f4377b2e91cd435309061aeb41cc2597d362d31482ce335fb250fe1b7698f7c42ad1d24bcc0d5f056113cff80efcfb4f452c0f545e65265f193830e9b489fe6fbef44a9b91e22f360909a417a55d634e2cfd70fbf06d069b94c36fb4e250a1be38c2aafb4258a55938b31a8027ff78fbed9020965bf7c7615d6cf246a17c8ca1f3baecb4cfa4795bd6ec99f18d07af20677ddd89a6b5169a0e979d85dd708c8ca1d269c608abdb8e87b0e70afcb6df9cfc2444309033f639c2dced7bbde8d8e9b6ec5b079645dcea914ac6c8194a58c11cebd7f6f0606b55fa42c237e4ca8dd52371a8664169b29faa5b85e405304d870597bb0e71e7722b4365c83a29090a417a8810ad74517fd70ddff8202b1603817ea8d242f1a364516beb01ce47af180941f443fbb190a7308150e440009958b70c34a75ae82f89fe087b835a5907fd3af3689c8e7edaca007bdb45683fd1f8f81a1f504eb96c1d8cc0d51d71a3544bd0a30c317c42f9b8865f236d772b2100b2e24b8be790082e4e0d04e1d354663bf14b0dd9a0a2c77a8b328965a426679dc45e03813b9e004730394b02294cfad8be33a9ba123c0c323c7b2951e39443f7374f0da42ffef10fded3b1e723bac400225086dc3393b04709d39fe541455fdf9caacaceec6bcca0bb4b377b0413b304a5c40e2e4c8808ad70fafc9e1f4ef93d163f25b3d839ab4a9604a7a1e2fbbd22bd6da36033b6465a40649db4e12cd1d676009a161b9701909069b93e06015ab78b1f257970b32812a629d8635795345bdb95b4c3db24ad4de98a66e3880e3ef616f7587a63b22ee00`);

console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);