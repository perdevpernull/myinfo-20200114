const crypto = require("crypto");

function generate_random_string(lenght) {
    return crypto.randomBytes(Math.ceil(lenght / 2))
        .toString('hex')
        .slice(0, lenght);
}

function hash_with_sha512(password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        hash:value
    };
}

function CryptoUtil() {
    //
}

CryptoUtil.prototype.hash_password_with_salt = (password) => {
    var salt = generate_random_string(16);
    return hash_with_sha512(password, salt);
};

module.exports = CryptoUtil;