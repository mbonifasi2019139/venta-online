"use strict";

const express = require("express");
const userController = require("./../controllers/user-controller");

const api = express.Router();

api.post("/createUserAdmin", userController.createUserAdmin);
api.post("/login", userController.login);

module.exports = api;