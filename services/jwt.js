"use strict";

const jwt = require("jwt-simple");
const moment = require("moment");

const secretKey = "encriptacion-IN6AM@";

exports.createToken = (user) => {
    let playload = {
        sub: user._id,
        username: user.username,
        password: user.password,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(2, "hours").unix(),
    };
    return jwt.encode(playload, secretKey);
};