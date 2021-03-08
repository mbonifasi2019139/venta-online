"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema({
    username: { type: String, lowercase: true },
    password: String,
    role: { type: String, default: "rol_cliente" },
});

module.exports = mongoose.model("user", userSchema);