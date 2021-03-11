"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user-routes");
const categoryRoutes = require("./routes/category-routes");
const productRoutes = require("./routes/product-routes");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//CORS declaration and settings
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);

module.exports = app;