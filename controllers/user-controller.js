"use strict";

const User = require("./../models/user-model");
const ShoppingCart = require("./../models/shopping-cart-model");
const Product = require("./../models/product-model");
const Invoice = require("./../models/invoice-model");
const Category = require("./../models/category-model");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");
const { param } = require("../routes/user-routes");

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
                            return res.send({
                                token: jwt.createToken(userFound),
                                "Compras realizadas": userFound.invoices,
                            });
                        } else {
                            return res.status(403).send({ message: `Password no coincide` });
                        }
                    }
                );
            } else {
                return res.status(404).send({ message: "Usuario no" });
            }
        }).populate("invoices");
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
 * la funcion de login del usuario admin es la misma para el cliente
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

function addToShoppingCart(req, res) {
    let shoppingCart = new ShoppingCart();

    let userId = req.user.sub;
    let params = req.body;

    User.findById(userId, (err, userFound) => {
        if (err) {
            return res.status(500).send({ message: "Error general" });
        } else if (userFound) {
            let products = userFound.shoppingCart;
            var productExists;
            var index;
            var amount = 0;

            for (let i = 0; i < products.length; i++) {
                if (products[i].productId == params.productId) {
                    index = i;
                    productExists = products[index];
                    console.log(products[index]);
                    break;
                }
            }

            if (productExists) {
                Product.findById(productExists.productId, (err, productFound) => {
                    if (err) {
                        return res.status(500).send({ message: "Error general" });
                    } else if (productFound) {
                        let stock = productFound.stock;
                        let newQuantity =
                            parseInt(productExists.quantity) + parseInt(params.quantity);
                        amount = newQuantity * parseInt(productFound.price);

                        if (newQuantity > stock) {
                            return res
                                .status(400)
                                .send({ message: "No hay suficiente stock", stock });
                        } else {
                            User.findOneAndUpdate({ _id: userId, "shoppingCart._id": productExists._id }, {
                                    "shoppingCart.$.quantity": newQuantity,
                                    "shoppingCart.$.amount": amount,
                                }, { new: true },
                                (err, userUpdated) => {
                                    if (err) {
                                        return res.status(500).send({ message: "Error general" });
                                    } else if (userUpdated) {
                                        return res.send({ message: "User", userUpdated });
                                    } else {
                                        return res
                                            .status(404)
                                            .send({ message: "No se pudo actualizar el carrito" });
                                    }
                                }
                            );
                        }
                    } else {
                        return res
                            .status(404)
                            .send({ message: "No se encontro el producto" });
                    }
                });
            } else {
                if (params.productId && params.quantity) {
                    Product.findById(params.productId, (err, productFound) => {
                        if (err) {
                            return res.status(500).send({ message: "Error general" });
                        } else if (productFound) {
                            var stock = parseInt(productFound.stock);

                            if (stock >= params.quantity && !(stock <= 0)) {
                                //Calculamos el monto total por el producto
                                let price = parseInt(productFound.price);
                                amount = parseInt(params.quantity) * price;

                                shoppingCart.productId = params.productId;
                                shoppingCart.quantity = params.quantity;
                                shoppingCart.amount = amount;

                                User.findByIdAndUpdate(
                                    userId, { $push: { shoppingCart: shoppingCart } }, { new: true },
                                    (err, userUpdate) => {
                                        if (err) {
                                            return res
                                                .status(500)
                                                .send({ message: "Error general", err });
                                        } else if (userUpdate) {
                                            return res.send({
                                                message: "Producto agregado al carrito",
                                                userUpdates: userUpdate,
                                            });
                                        } else {
                                            return res
                                                .status(403)
                                                .send({ message: "No se pudo agregar al carrito" });
                                        }
                                    }
                                );
                            } else {
                                return res
                                    .status(403)
                                    .send({ message: "No existen suficientes productos" });
                            }
                        } else {
                            return res.status(404).send({
                                message: "No se encontro el poducto que desea agregar al carrito",
                            });
                        }
                    });
                } else {
                    return res.status(403).send({ message: "Ingrese todos los datos" });
                }
            }
        } else {}
    }).populate();
}

function getMostSelledProducts(req, res) {
    Product.find({})
        .sort({ quantity_sold: "desc" })
        .limit(3)
        .exec((err, products) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (products) {
                return res.send({
                    message: "Los 3 productos mas vendidos: ",
                    products,
                });
            } else {
                return res.status(404).send({ message: "No hay productos" });
            }
        });
}

function searchProductsByName(req, res) {
    let params = req.body;

    if (!params.name) {
        return res.status(403).send({ message: "Ingrese el nombre del producto" });
    } else {
        Product.find({ $or: [{ name: params.name }] }, (err, productFound) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (productFound) {
                return res.send({ message: "Productos encontrados", productFound });
            } else {
                return res
                    .status(404)
                    .send({ message: "No se encontro producto con ese nombre" });
            }
        });
    }
}

function updateUserClient(req, res) {
    let userId = req.params.idU;
    let update = req.body;

    if (userId != req.user.sub) {
        return res.status(403).send({ message: "Ingrese el nombre del producto" });
    } else {
        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (userUpdate) {
                return res.send({ message: "User updated", userUpdate });
            } else {
                return res.status(500).send({ message: "Error general" });
            }
        });
    }
}

function deleteAccount(req, res) {
    let userId = req.params.idU;
    let params = req.body;

    if (userId != req.user.sub) {
        return res.status(403).send({ message: "Ingrese el nombre del producto" });
    } else {
        if (!params.password) {
            return res
                .status(400)
                .send({ message: "Ingrese la password para validar" });
        } else {
            bcrypt.compare(
                params.password,
                req.user.password,
                (err, passwordCheck) => {
                    if (err) {
                        return res
                            .status(500)
                            .send({ message: "Error general checkeando la password" });
                    } else if (passwordCheck) {
                        User.findByIdAndRemove(userId, (err, userRemoved) => {
                            if (err) {
                                return res.status(500).send({ message: "Error general" });
                            } else if (userRemoved) {
                                return res.send({ message: "Usuario eliminado correctamente" });
                            } else {
                                return res.status(404).send({ message: "No existe usuarios" });
                            }
                        });
                    } else {
                        return res
                            .status(403)
                            .send({ message: "La password no es correcta" });
                    }
                }
            );
        }
    }
}

function showDetailInvoice(req, res) {
    let invoiceId = req.params.idI;
    let userId = req.user.sub;

    if (!invoiceId) {
        return res.status(400).send({ message: "ingrese el id de la factura" });
    } else {
        Invoice.findOne({ _id: invoiceId, userId: userId }, (err, invoiceFound) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (invoiceFound) {
                return res.send({ message: "Factura encontrada", invoiceFound });
            } else {
                return res.status(404).send({ message: "No existe la factura" });
            }
        });
    }
}

function searchByCategory(req, res) {
    let cateogoryId = req.params.idC;

    if (!cateogoryId) {
        return res.status(400).send({ message: "ingrese el id de la categoria" });
    } else {
        Category.findById(cateogoryId, (err, categoryFound) => {
                if (err) {
                    return res.status(500).send({ message: "Error general" });
                } else if (categoryFound) {
                    return res.send({
                        message: "Productos por categoria",
                        products: categoryFound.productsId,
                    });
                } else {
                    return res.status(404).send({ message: "No existe la categoria" });
                }
            })
            .select("productsId")
            .populate("productsId");
    }
}

function showCategories(req, res) {
    Category.find({}).exec((err, categories) => {
        if (err) {
            return res.status(500).send({ message: "Error general" });
        } else if (categories) {
            return res.send({
                message: "categorias",
                categories,
            });
        } else {
            return res.status(404).send({ message: "No categoria" });
        }
    });
}

module.exports = {
    // Para el admin
    createUserAdmin,
    login, // para todos los usuarios
    createUser,
    updateUser,
    deleteUser,
    getUsers,

    // Para el usuario
    registerUserClient,
    addToShoppingCart,
    getMostSelledProducts,
    searchProductsByName,
    updateUserClient,
    deleteAccount,
    showDetailInvoice,
    searchByCategory,
    showCategories,
};