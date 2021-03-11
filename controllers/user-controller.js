"use strict";

const User = require("./../models/user-model");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");

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

/** Esta funciion sirve para tanto para el usuario administrador como para el cliente inicien sesion */
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
                            return res.send({ toke: jwt.createToken(userFound) });
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

function createUser(req, res) {
    let user = new User();
    let params = req.body;

    if (params.username && params.password && params.role) {
        User.findOne({ username: params.username.toLowerCase() },
            (err, userFound) => {
                if (err) {
                    return res.status(500).send({ message: "Error general" });
                } else if (userFound) {
                    return res
                        .status(403)
                        .send({ message: "Username ya existe, ingrese otro" });
                } else {
                    bcrypt.hash(params.password, null, null, (err, passwordHashed) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ message: "Error general, encriptando la password" });
                        } else if (passwordHashed) {
                            user.username = params.username.toLowerCase();
                            user.password = passwordHashed;
                            user.role = params.role;

                            user.save((err, userSaved) => {
                                if (err) {
                                    return res
                                        .status(500)
                                        .send({ message: "Error general, guardando al usuario" });
                                } else if (userSaved) {
                                    return res.send({
                                        message: "Usuario guardado correctamente",
                                        user: userSaved,
                                    });
                                } else {
                                    return res
                                        .status(400)
                                        .send({ message: "No se puedo guardar al usuario" });
                                }
                            });
                        } else {
                            return res
                                .status(400)
                                .send({ message: "No se pudo encriptar la password" });
                        }
                    });
                }
            }
        );
    } else {
        return res.status(400).send({ message: "Ingrese los datos necesarios" });
    }
}

function updateUser(req, res) {
    let userId = req.params.idU;
    let update = req.body;

    if (update.password) {
        return res
            .status(400)
            .send({ message: "No puedes actualizar la password desde esta funcion" });
    } else {
        User.findOne({ username: update.username.toLowerCase() },
            (err, userFound) => {
                if (err) {
                    return res.status(500).send({ message: "Error general" });
                } else if (userFound) {
                    return res
                        .status(401)
                        .send({ message: "Username existente, por favor ingresa otro" });
                } else {
                    User.findById(userId, (err, userFound) => {
                        if (err) {
                            return res.status(500).send({ message: "Error general" });
                        } else if (userFound) {
                            if (userFound.role !== "rol_cliente") {
                                return res.send({
                                    message: "El usuario no es un cliente, solamente puede actualizar usuarios cliente",
                                });
                            } else {
                                User.findByIdAndUpdate(
                                    userId,
                                    update, { new: true },
                                    (err, userUpdated) => {
                                        if (err) {
                                            return res.status(500).send({
                                                message: `Error general, actualizando al usario`,
                                            });
                                        } else if (userUpdated) {
                                            return res.send({
                                                message: `Usuario actualizado correctamente`,
                                            });
                                        } else {
                                            return res
                                                .status(400)
                                                .send({ message: `No se pudo actualizar al usuario` });
                                        }
                                    }
                                );
                            }
                        } else {
                            return res.status(404).send({ message: "Usuario no existente" });
                        }
                    });
                }
            }
        );
    }
}

// Validar que no se pueda actualizar la password*
function deleteUser(req, res) {
    let userId = req.params.idU;

    if (userId) {
        User.findById(userId, (err, userFound) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (userFound) {
                if (userFound.role !== "rol_cliente") {
                    return res.send({
                        message: "El usuario no es un cliente, solamente puede actualizar usuarios cliente",
                    });
                } else {
                    User.findByIdAndRemove(userId, (err, userRemoved) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ message: "Error general eliminando el usuario" });
                        } else if (userRemoved) {
                            return res.send({ message: "Usuario eliminado correctamente" });
                        } else {
                            return res
                                .status(403)
                                .send({ message: "No se pudo eliminar el usuario" });
                        }
                    });
                }
            } else {
                return res.status(404).send({ message: "Usuario no encontrado" });
            }
        });
    } else {
        return res.status(400).send({ message: "Ingrese los datos necesarios" });
    }
}

function getUsers(req, res) {
    User.find({})
        .populate()
        .exec((err, users) => {
            if (err) {
                return res
                    .status(500)
                    .send({ message: `Error general listando los usuarios` });
            } else if (users) {
                return res.send({ message: `Usuarios encontrados`, users });
            } else {
                return res.status(404).send({ message: `No existen usuarios` });
            }
        });
}

/**
 * Funciones para el usuario cliente para el usaurio cliente
 */

function registerUserClient(req, res) {
    let user = new User();
    let params = req.body;

    // El rol va a ser por defect
    const role = "rol_cliente";

    if (!params.username && !params.password) {
        return res.status(400).send({ message: "Ingrese los datos necesarios" });
    } else {
        User.findOne({ username: params.username.toLowerCase() },
            (err, userFound) => {
                if (err) {
                    return res.status(500).send({ message: "Error general" });
                } else if (userFound) {
                    return res
                        .status(403)
                        .send({ message: "Username existente, ingrese otro" });
                } else {
                    bcrypt.hash(params.password, null, null, (err, passwordHashed) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ message: "Error general encriptando la password" });
                        } else if (passwordHashed) {
                            user.username = params.username.toLowerCase();
                            user.password = passwordHashed;
                            user.role = role;

                            user.save((err, userSaved) => {
                                if (err) {
                                    return res.status(500).send({ message: "Error general" });
                                } else if (userSaved) {
                                    return res.send({
                                        message: "Usuario cliente guardado correctamente",
                                        userSaved,
                                    });
                                } else {
                                    return res
                                        .status(404)
                                        .send({ message: "No se pudo guardar el usuario cliente" });
                                }
                            });
                        } else {
                            return res
                                .status(404)
                                .send({ message: "No se pudo encriptar la password" });
                        }
                    });
                }
            }
        );
    }
}

module.exports = {
    createUserAdmin,
    login,
    createUser,
    updateUser,
    deleteUser,
    getUsers,
    registerUserClient,
};