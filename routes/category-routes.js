"use strict";

const express = require("express");
const mdAuth = require("./../middlewares/authenticated");
const categoryController = require("./../controllers/category-controller");

const api = express.Router();

api.post(
    "/saveCategory", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    categoryController.saveCategory
);
api.get(
    "/getCategories", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    categoryController.getCategories
);
api.get(
    "/createDefaultCategory", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    categoryController.createDefaultCategory
);
api.put(
    "/updateCategory/:idC", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    categoryController.updateCategory
);
api.delete(
    "/deleteCategory/:idC", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    categoryController.deleteCategory
);

module.exports = api;