const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const UserRoutes = require("./routes/user");
const ApiRoutes = require("./routes/api");

mongoose.connect("mongodb://localhost/leavedb", { useNewUrlParser: true });
let db = mongoose.connection;

db.once("open", (err) => {
    console.log("Connected to mongodb");
})

db.on("error", (err) => {
    console.log("err");
})

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.use("/user", UserRoutes);
app.use("/api", ApiRoutes);

app.listen("8080", () => {
    console.log("App listening on PORT 8080");
})