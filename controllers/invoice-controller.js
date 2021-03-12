"use strict";

const User = require("./../models/user-model");
const Product = require("./../models/product-model");
const Category = require("./../models/category-model");
const Invoice = require("./../models/invoice-model");

/**
 * Fuciones de la factura para el administrador
 */

function getAllInvoices(req, res) {
    User.find()
        .populate("invoices")
        .select("invoices")
        .exec((err, users) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (users) {
                let usersInvoices = users.filter(
                    (element) => element.invoices.length > 0
                );
                return res.send({
                    message: "Facturas empleados",
                    facturas: usersInvoices,
                });
            } else {
                return res.status(404).send({ message: "No existe usuarios" });
            }
        });
}

function getAllClientInvoices(req, res) {
    let userId = req.params.idU;

    if (!userId) {
        return res.status(404).send({ message: "Ingrese el ID del usuario" });
    } else {
        User.findById(userId)
            .populate("invoices")
            .select("invoices")
            .exec((err, user) => {
                if (err) {
                    return res.status(500).send({ message: "Error general" });
                } else if (user) {
                    // let usersInvoices = users.filter(
                    //     (element) => element.invoices.length > 0
                    // );
                    if (user.invoices.length > 0) {
                        return res.send({
                            message: "Facturas empleado",
                            facturas: user,
                        });
                    } else {
                        return res.send({
                            message: "El empleado no tiene factura",
                            facturas: user,
                        });
                    }
                } else {
                    return res.status(404).send({ message: "No existe el usuario" });
                }
            });
    }
}

function getProductsInvoice(req, res) {
    let invoiceId = req.params.idI;

    if (invoiceId) {
        Invoice.findById(invoiceId, (err, productsInvoice) => {
                if (err) {
                    return res.status(500).send({ message: "Error general" });
                } else if (productsInvoice) {
                    return res.send({
                        message: "Productso de la factura",
                        products: productsInvoice.shoppingCart,
                    });
                } else {
                    return res.status(404).send({ message: "No existe la factura" });
                }
            })
            // .select("shoppingCart.productId")
            .populate("shoppingCart.productId")
            .select("productId");
        // .populate("quantity_sold");
    } else {
        return res.status(400).send({ message: "Ingrese el ID de la factura" });
    }
}

function getOutOfStockProducts(req, res) {
    Product.find({ stock: 0 }, (err, products) => {
        if (err) {
            return res.status(500).send({ message: "Error general" });
        } else if (products) {
            return res.send({ message: "Productos agotados: ", products });
        } else {
            return res.status(404).send({ message: "No hay productos agotados" });
        }
    });
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

/**
 * Funciones de la factura para el cliente
 */

function createInvoice(req, res) {
    let invoice = new Invoice();
    let userId = req.user.sub;

    User.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).send({ message: "Error general", err });
        } else if (user) {
            let products = user.shoppingCart; //[{},{},{},...]
            if (products) {
                let idProduct = 0;
                let quantity = 0;

                // Para la factura
                let totalToPay = 0;
                invoice.shoppingCart = [];

                // Descontando del stock, agregando los mas vendidos y sacando el todal por pagar

                for (let index = 0; index < products.length; index++) {
                    //------------- Para la factura
                    //Agregamos los productos vendidos a la factura
                    invoice.shoppingCart.push(products[index]);
                    // Sacamos el total a pagar
                    totalToPay += parseInt(products[index].amount);
                    //-------------

                    idProduct = products[index].productId;
                    quantity = products[index].quantity;

                    Product.findById(idProduct, (err, product) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ message: "Error general en el array" });
                        } else if (product) {
                            let newStock = parseInt(product.stock) - parseInt(quantity);
                            let qsold = parseInt(product.quantity_sold) + parseInt(quantity);

                            Product.findByIdAndUpdate(
                                idProduct, { stock: newStock, quantity_sold: qsold },
                                (err, stockUpdated) => {
                                    if (err) {
                                        return res.status(500).send({
                                            message: "Error general actualizando el array",
                                            err,
                                        });
                                    } else if (stockUpdated) {
                                        return;
                                    } else {
                                        return res.status(500).send({ message: "Error general" });
                                    }
                                }
                            );
                        } else {
                            return res.status(404).send({ message: "No existe el producto" });
                        }
                    });
                }

                console.log(invoice.shoppingCart + "aaaaaa");
                invoice.userId = userId;
                invoice.total = totalToPay;

                invoice.save((err, invoiceSaved) => {
                    if (err) {
                        return res
                            .status(500)
                            .send({ message: "Error general guardando la factura", err });
                    } else if (invoiceSaved) {
                        User.findByIdAndUpdate(
                            userId, { $push: { invoices: invoiceSaved._id }, shoppingCart: [] }, { new: true },
                            (err, userUpdated) => {
                                if (err) {
                                    return res.status(500).send({ message: "Error general" });
                                } else if (userUpdated) {
                                    return res.send({
                                        message: "Factura creada correctameta!",
                                        userUpdated,
                                        invoiceSaved,
                                    });
                                } else {
                                    return res.status(404).send({
                                        message: "No se pudo actualizar y agregar la factura",
                                    });
                                }
                            }
                        );
                    } else {
                        return res.status(403).send({ message: "No se puedo guardar" });
                    }
                });
            } else {
                return res
                    .status(404)
                    .send({ message: "No hay productos en el carrito" });
            }
        } else {
            return res.status(404).send({ message: "Usuario no encontrado", userId });
        }
    });
}

module.exports = {
    createInvoice,
    getProductsInvoice,
    getOutOfStockProducts,
    getMostSelledProducts,
    getAllInvoices,
    getAllClientInvoices,
};