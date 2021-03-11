"use strict";

const express = require("express");
const mdAuth = require("./../middlewares/authenticated");
const productController = require("./../controllers/product-controller");

const api = express.Router();

api.post(
    "/createProduct/:idC", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    productController.setProduct
);
api.post(
    "/getProduct/:idP", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    productController.getProduct
);
api.get("/getProducts/", productController.getProducts);
api.put(
    "/:idC/updateProduct/:idP", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    productController.updateProduct
);
api.put(
    "/:idC/updateStockProduct/:idP", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    productController.updateStockProduct
);
api.delete(
    "/:idC/removeProduct/:idP", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    productController.removeProduct
);

module.exports = api;