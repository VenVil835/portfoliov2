const bcrypt = require('bcryptjs');

const hash = '$2b$10$PQiVrGcXmOdIhYKPsiRkXOB46LjnBH94SCaVtgQEtN020JxLLctCO';
const password = 'password';

bcrypt.compare(password, hash).then(isValid => {
    console.log(`Password matches hash: ${isValid}`);

    // Generate new hash just in case
    bcrypt.hash(password, 10).then(newHash => {
        console.log(`New hash for 'password': ${newHash}`);
    });
});
