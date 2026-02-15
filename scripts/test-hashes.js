const bcrypt = require('bcryptjs');

const hash1 = '$2b$10$PNOMV5CbuxJD94ZGkwBUU.2tTXH5Fy2tVF5W7Y74K2G56ARBTFMm6'; // from .env.local
const hash2 = '$2b$10$ptoOJ4FOy2HDEgO/au94/uCnVMbARPINaw5AKz6KnlFe7ePB7voxG'; // from json

const testPasswords = ['admin', 'password', 'admin1234', 'Password123'];

console.log('Testing hash from .env.local...');
testPasswords.forEach(async (pwd) => {
    const matches = await bcrypt.compare(pwd, hash1);
    if (matches) {
        console.log(`✓ Hash1 (.env.local) matches: "${pwd}"`);
    }
});

console.log('\nTesting hash from admin-credentials.json...');
testPasswords.forEach(async (pwd) => {
    const matches = await bcrypt.compare(pwd, hash2);
    if (matches) {
        console.log(`✓ Hash2 (json) matches: "${pwd}"`);
    }
});

// Wait for async operations
setTimeout(() => {
    console.log('\nTest complete.');
}, 1000);
