"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = Schema({
    shoppingCart: [],
    date: { type: Date, default: Date.now },
    userId: { type: Schema.ObjectId, ref: "user" },
    total: Number,
});

module.exports = mongoose.model("invoice", invoiceSchema);