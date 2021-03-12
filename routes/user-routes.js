"use strict";

const express = require("express");
const mdAuth = require("./../middlewares/authenticated");
const userController = require("./../controllers/user-controller");

const api = express.Router();

api.post("/createUserAdmin", userController.createUserAdmin);
api.post("/login", userController.login);
api.post(
    "/registerUser", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    userController.createUser
);
api.post(
    "/updateUser/:idU", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    userController.updateUser
);
api.delete(
    "/deleteUser/:idU", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    userController.deleteUser
);

api.get(
    "/getUsers", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],
    userController.getUsers
);

// Metodos para el usuario cliente
api.post("/registerUserClient", userController.registerUserClient);
api.put(
    "/addToShoppingCart/:idU", [mdAuth.ensureAuth, mdAuth.ensureAuthClient],
    userController.addToShoppingCart
);

api.put(
    "/getMostSelledProducts", [mdAuth.ensureAuth, mdAuth.ensureAuthClient],
    userController.getMostSelledProducts
);

api.post(
    "/searchProductsByName", [mdAuth.ensureAuth, mdAuth.ensureAuthClient],
    userController.searchProductsByName
);

api.post(
    "/showDetailInvoice/:idI", [mdAuth.ensureAuth, mdAuth.ensureAuthClient],
    userController.showDetailInvoice
);

api.post(
    "/searchByCategory/:idC", [mdAuth.ensureAuth, mdAuth.ensureAuthClient],
    userController.searchByCategory
);

api.get(
    "/showCategories", [mdAuth.ensureAuth, mdAuth.ensureAuthClient],
    userController.showCategories
);

api.post(
    "/updateUserClient/:idU", [mdAuth.ensureAuth, mdAuth.ensureAuthClient],
    userController.updateUserClient
);

api.delete(
    "/deleteAccount/:idU", [mdAuth.ensureAuth, mdAuth.ensureAuthClient],
    userController.deleteAccount
);

module.exports = api;