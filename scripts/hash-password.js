const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
    console.error('Please provide a password to hash');
    console.log('Usage: node scripts/hash-password.js "yourpassword"');
    process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nCopy this to your .env.local file:');
console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
console.log(`ADMIN_USER="admin"`);
