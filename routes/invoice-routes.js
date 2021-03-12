"use strict";

const express = require("express");
const mdAuth = require("./../middlewares/authenticated");
const invoiceController = require("./../controllers/invoice-controller");

const api = express.Router();

// metodos para el administrador
api.get(
    "/getAllInvoices", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    invoiceController.getAllInvoices
);

api.post(
    "/getAllClientInvoices/:idU", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    invoiceController.getAllClientInvoices
);

api.post(
    "/getProductsInvoice/:idI", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    invoiceController.getProductsInvoice
);

api.get(
    "/getOutOfStockProducts", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    invoiceController.getOutOfStockProducts
);

api.get(
    "/getMostSelledProducts", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    invoiceController.getMostSelledProducts
);

api.post(
    "/createInvoice", [mdAuth.ensureAuth, mdAuth.ensureAuthClient],
    invoiceController.createInvoice
);

module.exports = api;