"use strict";

const mongoose = require("mongoose");
const app = require("./app");
const port = 3000;

mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);

mongoose
    .connect("mongodb://127.0.0.1:27017/ventaonline", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log(`Servidor cargando...`);
        app.listen(port, () => {
            console.log(`Servidor Express escuchando en el puerto ${port} ...`);
        });
    })
    .catch((err) => {
        console.log(`Ha ocurrido un error: ${err}`);
    });