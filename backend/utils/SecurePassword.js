const bcrypt = require('bcrypt')

const hashPassword = async(originalPassword) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(originalPassword, salt);
    return hash;
}

module.exports = {hashPassword}