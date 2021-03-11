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

api.post("/registerUserClient", userController.registerUserClient);

module.exports = api;