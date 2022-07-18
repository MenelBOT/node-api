const { make, Password } = require("simple-body-validator");

// This only as default
const fields = {
	username: "employeeNew",
	email: "hiree@company.com",
	password: require("crypto").randomBytes(5).toString("hex"),
};

const rules = {
	username: "required|max:40",
	email: "required|email",
	password: Password.create().min(4).numbers().letters().mixedCase().symbols(),
};

const validator = make(fields, rules);

module.exports = validator;