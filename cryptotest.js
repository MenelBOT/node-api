const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prompt = require("prompt-sync")({ sigint:true });
let bytes;
const acceptableEncoding = ["ascii", "utf8", "utf-8", "utf16le", "ucs2", "ucs-2", "base64", "base64url", "latin1", "binary", "hex"];
let encoding;

let pass = false;
while (!pass) {
	bytes = Number(prompt("Bytes length: "));
	if (isNaN(bytes)) console.log("Given value is not numeric, please try again");
	else pass = true;
}

pass = false;

while (!pass) {
	encoding = prompt("Encoding: ");
	if (acceptableEncoding.includes(encoding)) pass = true;
	else console.log("Given encoding doesn't resolve to any of the acceptable encoding types\nAcceptable inputs: 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex'");
}

console.log(crypto.randomBytes(bytes).toString(encoding));

bcrypt.hash("LikePonies123!@#", 10).then(hash => {
	console.log(hash);
}).catch(error => {
	console.error(error);
}).finally(() => {
	console.log("ok am done");
});