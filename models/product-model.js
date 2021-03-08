"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema({
    name: String,
    price: Number,
    stock: Number,
    quantity_sold: Number,
});

module.exports = mongoose.model("product", productSchema);