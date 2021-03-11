"use strict";

const jwt = require("jwt-simple");
const moment = require("moment");
const secretKey = "encriptacion-IN6AM@";

exports.ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res
            .status(403)
            .send({ message: "No existe el header de autenticacion" });
    } else {
        var token = req.headers.authorization.replace(/['"']+/g, "");
        try {
            var payload = jwt.decode(token, secretKey);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: "La sesion ha expirado" });
            }
        } catch (error) {
            return res.status(404).send({ message: "Token invalido" });
        }

        req.user = payload;
        next();
    }
};

//Validamos que un usuario sea administrador
exports.ensureAuthAdmin = (req, res, next) => {
    let payload = req.user;
    if (payload.role !== "rol_admin")
        return res.status(403).send({
            message: `No tienes autorizacion, no eres un usuario administrador`,
        });
    else return next();
};

exports.ensureAuthClient = (req, res, next) => {
    let payload = req.user;

    if (payload.role !== "rol_cliente")
        return res
            .status(403)
            .send({ message: `No tienes autorizacion, no eres un usuario cliente` });
    else return next();
};

exports.ensureNoSession = (req, res, next) => {
    let payload = req.user;

    if (payload) return res.send({ message: `Ya ha iniciado sesion un usuario` });
    else next();
};