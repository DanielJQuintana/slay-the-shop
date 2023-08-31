/**
 * NAME: Daniel Quintana
 * DATE: 6/8/23
 * 
 * This file the back-end implementation for my CS 132 Final Project, the Slay the Shop! 
 * E-commerce store. It allows the user to switch between various website views, and implements the 
 * fetch calls necessary to pull product information from the Slay the Shop API to display to the 
 * user, as well as allowing for message submission.
 * 
 * This API supports the following endpoints:
 * GET /products
 * GET /product
 * GET /promotions
 * 
 * POST /service
 */


"use strict";
const express = require("express");
const fs = require("fs/promises");

const app = express();
app.use(express.static("public"));

const multer = require("multer");

// for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none());

const SERVER_ERR = 500;
const SERVER_ERR_MSG = "Something went wrong on the server, please try again later.";
const CLIENT_ERR = 400;
const NOT_FOUND_ERR = 404;

const DATA_PATH = "store_data/";

app.get("/products", async (req, res, next) => {
  try {
    let contents = await fs.readFile(DATA_PATH + "products.json", "utf8");
    let data = JSON.parse(contents);

    for (const key in req.query) { 
      const property = key.toLowerCase(); 
      const value = req.query[property].toLowerCase();

      data = filterProducts(data, property, value);

      if (!data) {
        res.status(CLIENT_ERR);
        next(Error("Products do not have property \"" + key + "\"."));
      }

      if (data.length === 0) {
        break;
      }
    } 

    let imagePaths = data.reduce((acc, item) => acc + item.image + ",", "");
    imagePaths = imagePaths.slice(0, imagePaths.length - 1);

    res.type("text");
    res.send(imagePaths);
  } catch (err) {
    res.status(SERVER_ERR);
    err.message = SERVER_ERR_MSG;
    next(err);
  }
});

app.get("/product", async (req, res, next) => {
  try {
    let contents = await fs.readFile(DATA_PATH + "products.json", "utf8");
    let data = JSON.parse(contents);
    let name = req.query.name;

    if (!name) {
      res.status(CLIENT_ERR);
      next(Error("Missing parameter for /product GET endpoint - parameters: name"));
    }

    data = data.find(item => item.name === name);

    if (!data) {
      res.status(NOT_FOUND_ERR);
      next(Error("No product named \"" + name + "\"."));
    }

    res.type("json");
    res.send(data);
  } catch (err) {
    res.status(SERVER_ERR);
    err.message = SERVER_ERR_MSG;
    next(err);
  }
});

app.get("/promotions", async (req, res, next) => {
  try {
    let contents = await fs.readFile(DATA_PATH + "promotions.json", "utf8");
    let data = JSON.parse(contents);
    
    const count = req.query["count"];

    if (count) {
      if (isNaN(count)) {
        res.status(CLIENT_ERR);
        next(Error("Parameter count must be a number."));
      }

      if (count > data.length) {
        res.status(CLIENT_ERR);
        next(Error("Cannot request more than " + data.length + " promotions."));
      } 

      if (count < 1) {
        res.status(CLIENT_ERR);
        next(Error("Must request at least 1 promotion."))
      }

      const remove = data.length - count;
      for (let i = 0; i < remove; i++) {
        data.splice(Math.floor(data.length * Math.random()), 1);
      }
    }

    res.type("json");
    res.send(data);
  } catch (err) {
    res.status(SERVER_ERR);
    err.message = SERVER_ERR_MSG;
    next(err);
  }
});

app.post("/service", async (req, res, next) => {
  const name = req.body.name;
  const guild = req.body.guild;
  const type = req.body.type;
  const message = req.body.message;
  const time = new Date().toUTCString();

  if (!(name && guild && type && message)) {
    res.status(CLIENT_ERR);
    next(Error("Missing parameter for /service POST endpoint - parameters: name, guild, type, message"));
  }
  
  const review = {"name" : name, "guild" : guild, "type" : type, "message" : message, "time" : time};
  
  try {
    let reviews = await fs.readFile(DATA_PATH + "reviews.json", "utf8");
    reviews = JSON.parse(reviews);
    reviews.push(review);
    await fs.writeFile(DATA_PATH + "reviews.json", JSON.stringify(reviews, null, 2), "utf8");
    res.type("text");
    res.send("The shop has received your message. Please check in with your guild for a response letter!");
  } catch (err) {
    res.status(SERVER_ERR);
    err.message = SERVER_ERR_MSG;
    next(err);
  }
});

function filterProducts(data, property, value) {
  if (!data[0][property]) {
    return null;
  }

  if (property === "name") {
    return data.filter(item => item["name"].includes(value));
  }

  return data.filter(item => item[property] === value);
}

function handleError(err, req, res, next) {
  res.type("text");
  res.send(err.message);
}

app.use(handleError);

const PORT = process.env.PORT || 8000;
app.listen(PORT);