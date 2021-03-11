"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema({
    username: { type: String, lowercase: true },
    password: String,
    role: { type: String, default: "rol_cliente" },
    shoppingCart: [{
        productId: { type: Schema.ObjectId, ref: "product" },
        quantity: { type: Number, default: 0 },
        amount: Number,
    }, ],
    invoices: { type: Schema.ObjectId, ref: "invoice" },
});

module.exports = mongoose.model("user", userSchema);