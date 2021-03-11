"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = Schema({
    shopingCart: { type: Schema.ObjectId, ref: "shoppingcart" },
    date: { type: Date, default: Date.now },
    userId: { type: Schema.ObjectId, ref: "user" },
});

module.exports = mongoose.model("invoice", invoiceSchame);