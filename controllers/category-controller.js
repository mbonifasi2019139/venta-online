"use strict";

const Category = require("./../models/category-model");
const bcrypt = require("bcrypt-nodejs");

function saveCategory(req, res) {
    let category = new Category();
    let params = req.body;

    if (!params.name) {
        return res.status(400).send({ message: "Ingrese los datos necesarios" });
    } else {
        category.name = params.name;
        category.save((err, categorySaved) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (categorySaved) {
                return res.send({
                    message: "Categoria guardada correctamente",
                    categorySaved,
                });
            } else {
                return res
                    .status(403)
                    .send({ message: "No se pudo guardar la categoria" });
            }
        });
    }
}

// Esta funcion es para crear la categoria por defecto
function createDefaultCategory(req, res) {
    let category = new Category();
    let name = "default_category";

    Category.findOne({ name: name }, (err, categoryFound) => {
        if (err) {
            return res.status(500).send({ message: "Error general" });
        } else if (categoryFound) {
            return res
                .status(403)
                .send({ message: "Categoria por defecto ya existe" });
        } else {
            category.name = name;
            category.save((err, defaultCategorySaved) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error general, guardando la categoria por defecto",
                    });
                } else if (defaultCategorySaved) {
                    return res.send({ message: "Categoria por defecto guardada" });
                } else {
                    return res
                        .status(400)
                        .send({ message: "No se pudo guardar la categoria por defecto" });
                }
            });
        }
    });
}

function getCategories(req, res) {
    Category.find({}, (err, categories) => {
        if (err) {
            return res.status(500).send({ message: "Error general" });
        } else if (categories) {
            return res.send({ message: "Categorias", categories });
        } else {
            return res.status(404).send({ message: "No hay categorias" });
        }
    });
}

function updateCategory(req, res) {
    let idCategory = req.params.idC;
    let update = req.body;

    if (!idCategory) {
        return res.status(400).send({ message: "Ingrese los datos necesarios" });
    } else {
        if (update.productsId) {
            return res.status(401).send({
                message: "No puedes actualizar los productos de esta categoria desde esta funcion",
            });
        } else {
            Category.findByIdAndUpdate(
                idCategory,
                update, { new: true },
                (err, categoryUpdated) => {
                    if (err) {
                        return res.status(500).send({ message: "Error general" });
                    } else if (categoryUpdated) {
                        return res.send({
                            message: "Categoria actualizada",
                            categoryUpdated,
                        });
                    } else {
                        return res.status(404).send({ message: "Categoria no existe" });
                    }
                }
            );
        }
    }
}

function deleteCategory(req, res) {
    let idCategory = req.params.idC;

    /**
     * Vamos a validar si dese eliminar una categoria, pidiendole
     */
    let passwordForValidate = req.body.password;

    var defaultCategory = "default_category";

    if (!idCategory) {
        return res.status(400).send({ message: "Ingrese los datos necesarios" });
    } else {
        if (!passwordForValidate) {
            return res.status(403).send({
                message: "Ingresa la password si esta seguro de querer eliminar la categoria",
            });
        } else {
            let passwordEncrypted = req.user.password;
            bcrypt.compare(
                passwordForValidate,
                passwordEncrypted,
                (err, passwordChecked) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error comparando las passwords",
                        });
                    } else if (passwordChecked) {
                        Category.findByIdAndRemove(idCategory, (err, categoryRemoved) => {
                            if (err) {
                                return res.status(500).send({
                                    message: "Error general eliminando la categoria",
                                });
                            } else if (categoryRemoved) {
                                let productsId = categoryRemoved.productsId;
                                Category.findOneAndUpdate({ name: defaultCategory }, { $push: { productsId: productsId } }, { new: true },
                                    (err, productsSavedInDefaultC) => {
                                        if (err) {
                                            return res.status(500).send({ message: "Error general" });
                                        } else if (productsSavedInDefaultC) {
                                            return res.send({
                                                message: "Categoria eliminada correctamente",
                                            });
                                        } else {
                                            return res.status(404).send({
                                                message: "No se pudo puederon guardar los productos en la categoria por defecto",
                                            });
                                        }
                                    }
                                );
                            } else {
                                return res
                                    .status(404)
                                    .send({ message: "No se puedo eliminar la categoria" });
                            }
                        });
                    } else {
                        return res.status(403).send({ message: "Password incorrecta" });
                    }
                }
            );
        }
    }
}

module.exports = {
    saveCategory,
    getCategories,
    createDefaultCategory,
    updateCategory,
    deleteCategory,
};