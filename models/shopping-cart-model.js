"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shoppingCartSchema = Schema({
    productId: { type: Schema.ObjectId, ref: "product" },
    quantity: { type: Number, default: 0 },
    amount: Number,
});

module.exports = mongoose.model("shoppingcart", shoppingCartSchema);