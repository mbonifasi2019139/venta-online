"use strict";

const ShoppingCart = require("./../models/shopping-cart-model");
const User = require("./../models/user-model");

function addToShoppingCart(req, res) {
    let userId = req.params.idU;
    let params = req.body;

    if (req.user.sub !== userId) {
        return res
            .status(404)
            .send({ message: "No coincide el ID que ingresaste" });
    } {
        User.findById();
        // if(
        //     !params.idProduct &&
        //    ! params.quantity
        // ){
        //     return res.status(400).send({message: "Ingrese los datos necesarios"});
        // }else {

        // }
    }
}

module.exports = {
    addToShoppingCart,
};