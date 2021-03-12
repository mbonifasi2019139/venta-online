"use strict";

const Category = require("./../models/category-model");
const Product = require("./../models/product-model");
const bcrypt = require("bcrypt-nodejs");

function setProduct(req, res) {
    let product = new Product();
    let idCategory = req.params.idC;
    let params = req.body;

    if (!idCategory) {
        return res.status(400).send({ message: "Ingrese el idCategoria" });
    } else {
        Category.findById(idCategory, (err, categoryFound) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (categoryFound) {
                if (params.name && params.price && params.stock) {
                    product.name = params.name;
                    product.price = params.price;
                    product.stock = params.stock;

                    product.save((err, productSaved) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ message: "Error general guardando el producto" });
                        } else if (productSaved) {
                            Category.findByIdAndUpdate(
                                idCategory, { $push: { productsId: productSaved._id } }, { new: true },
                                (err, categoryUpdated) => {
                                    if (err) {
                                        return res.status(500).send({ message: "Error general" });
                                    } else if (categoryUpdated) {
                                        return res.send({
                                            message: "Producto guardado correctamente",
                                        });
                                    } else {
                                        return res
                                            .status(403)
                                            .send({ message: "No se puedo actualizar la categoria" });
                                    }
                                }
                            );
                        } else {
                            return res
                                .status(403)
                                .send({ message: "No se pudo guardar el producto" });
                        }
                    });
                } else {
                    return res
                        .status(400)
                        .send({ message: "Ingrese todos los datos del producto" });
                }
            } else {
                return res.status(404).send({ message: "Categoria no existe" });
            }
        });
    }
}

function getProduct(req, res) {
    let idProduct = req.params.idP;

    if (!idProduct) {
        return res.status(400).send({ message: "Ingrese el codigo del producto" });
    } else {
        Product.findById(idProduct, (err, productFound) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (productFound) {
                return res.send({ message: "Producto encontrado", productFound });
            } else {
                return res.status(404).send({ message: "Producto no encontrado" });
            }
        });
    }
}

function getProducts(req, res) {
    Product.find({}).exec((err, products) => {
        if (err) {
            return res.status(500).send({ message: "Error general" });
        } else if (products) {
            return res.send({ message: "Producto encontrado", products });
        } else {
            return res.status(404).send({ message: "Producto no encontrado" });
        }
    });
}

function updateProduct(req, res) {
    let idCategory = req.params.idC;
    let idProduct = req.params.idP;

    let update = req.body;

    if (!idCategory && !idProduct) {
        return res
            .status(400)
            .send({ message: "Ingrese el idCategory y el idProduct" });
    } else {
        Category.findOne({ _id: idCategory, productsId: idProduct },
            (err, productFound) => {
                if (err) {
                    return res.status(500).send({ message: "Error general" });
                } else if (productFound) {
                    if (!update) {
                        return res
                            .status(403)
                            .send({ message: "Ingrese datos para actualizar" });
                    } else {
                        Product.findByIdAndUpdate(
                            idProduct,
                            update, { new: true },
                            (err, productUpdated) => {
                                if (err) {
                                    return res.status(500).send({
                                        message: "Error general actualizando el producto",
                                    });
                                } else if (productUpdated) {
                                    return res.send({
                                        message: "Producto actualizado correctamente",
                                        productUpdated,
                                    });
                                } else {
                                    return res
                                        .status(403)
                                        .send({ message: "No se pudo actualizar el producto" });
                                }
                            }
                        );
                    }
                } else {
                    return res.status(404).send({ message: "Product not found" });
                }
            }
        );
    }
}

function updateStockProduct(req, res) {
    let idCategory = req.params.idC;
    let idProduct = req.params.idP;

    let updateStock = req.body;

    if (!idCategory && !idProduct) {
        return res
            .status(400)
            .send({ message: "Ingrese el idCategory y el idProduct" });
    } else {
        Category.findOne({ _id: idCategory, productsId: idProduct },
            (err, productFound) => {
                if (err) {
                    return res.status(500).send({ message: "Error general" });
                } else if (productFound) {
                    if (!updateStock.stock) {
                        return res
                            .status(403)
                            .send({ message: "Por favor, ingrese el stock" });
                    } else {
                        Product.findByIdAndUpdate(
                            idProduct, {
                                stock: updateStock.stock,
                            }, { new: true },
                            (err, stockUpdated) => {
                                if (err) {
                                    return res
                                        .status(500)
                                        .send({ message: "Error general actualizando el stock" });
                                } else if (stockUpdated) {
                                    return res.send({
                                        message: "Stock actualizado",
                                        stockUpdated,
                                    });
                                } else {
                                    return res
                                        .status(403)
                                        .send({ message: "No se pudo actualizar el stock" });
                                }
                            }
                        );
                    }
                } else {
                    return res.status(404).send({ message: "No existe el producto" });
                }
            }
        );
    }
}

function removeProduct(req, res) {
    let idCategory = req.params.idC;
    let idProduct = req.params.idP;

    if (!idCategory && !idProduct) {
        return res
            .status(400)
            .send({ message: "Ingrese el idCategory y el idProduct" });
    } else {
        Category.findOneAndUpdate({ _id: idCategory, productsId: idProduct }, {
                $pull: { productsId: idProduct },
            }, { new: true },
            (err, productRemoved) => {
                if (err) {
                    return res.status(500).send({ message: "Error general" });
                } else if (productRemoved) {
                    Product.findByIdAndRemove(idProduct, (err, productRemoved) => {
                        if (err) {
                            return res.status(500).send({ message: "Error general" });
                        } else if (productRemoved) {
                            return res.send({ message: "Producto eliminado" });
                        } else {
                            return res
                                .status(500)
                                .send({ message: "No se pudo eliminar el producto" });
                        }
                    });
                } else {
                    return res
                        .status(404)
                        .send({ message: "No existe el producto que desea eliminar" });
                }
            }
        );
    }
}

module.exports = {
    setProduct,
    getProduct,
    getProducts,
    updateProduct,
    updateStockProduct,
    removeProduct,
};