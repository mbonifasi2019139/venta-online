"use strict";

const User = require("./../models/user-model");
const bcrypt = require("bcrypt-nodejs");
const e = require("express");

function createUserAdmin(req, res) {
    let user = new User();

    let username = "admin";
    let password = "admin";
    let role = "rol_admin";

    User.findOne({ username: username }, (err, userFound) => {
        if (err) {
            return res.status(500).send(`Error general ${err}`);
        } else if (userFound) {
            return res
                .status(404)
                .send({ message: `username ya existe, por favor ingresa otro ` });
        } else {
            bcrypt.hash(password, (err, passwordHashed) => {
                if (err) {
                    return res
                        .status(500)
                        .send(`Error general encriptando la password: ${err}`);
                } else if (passwordHashed) {
                    user.username = username;
                    user.password = passwordHashed;
                    user.role = role;

                    user.save((err, userSaved) => {
                        if (err) {
                            return res
                                .status(500)
                                .send(`Error general guardando al usuario administrador`);
                        } else if (userSaved) {
                            return res.send(`Usuario administrador creado`);
                        } else {
                            return res.status(403).send(`No se pudo crear el usuario`);
                        }
                    });
                } else {
                    return res.status(403).send(`No se pudo encriptar`);
                }
            });
        }
    });
}

function login(req, res) {
    let login = req.body;

    if (login.username && login.password) {
        User.findOne({ username: login.username }, (err, userFound) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (userFound) {
                bcrypt.compare(
                    login.password,
                    userFound.password,
                    (err, passwordCheck) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ message: `Error general verificando la password` });
                        } else if (passwordCheck) {
                            return res.send({ message: `Login exitoso` });
                        } else {
                            return res.status(403).send({ message: `Password no coincide` });
                        }
                    }
                );
            } else {
                return res.status(404).send({ message: "Usuario no" });
            }
        });
    } else {
        return res.status(400).send({ message: "Ingrese los todos los datos" });
    }
}

module.exports = {
    createUserAdmin,
    login,
};