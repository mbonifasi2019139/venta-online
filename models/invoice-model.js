"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = Schema({
    shoppingCart: [{
        productId: { type: Schema.ObjectId, ref: "product" },
        quantity: { type: Number, default: 0 },
        amount: Number, // esta propiedad se va a calcular cuando se haga la peticion para agregar al carrito
    }, ],
    date: { type: Date, default: Date.now },
    userId: { type: Schema.ObjectId, ref: "user" },
    total: Number,
});

module.exports = mongoose.model("invoice", invoiceSchema);