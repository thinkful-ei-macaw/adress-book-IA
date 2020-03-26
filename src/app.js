require("dotenv").config();
const uuid = require("uuid/v4");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const addresses = [];

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

token = process.env.NODE_TOKEN;

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/address", (req, res) => {
  res.send(addresses);
});

app.post("/address", (req, res) => {
  if (req.headers.authorization != `Bearer ${token}`) {
    res.status(404).send("incorrect authorization token or method");
  }

  const {
    firstName,
    lastName,
    address1,
    address2 = false,
    city,
    state,
    zip
  } = req.body;

  if (!firstName || !lastName || !address1 || !city || !state || !zip) {
    return res.status(400).send("missing required fields");
  }

  if (state.length != 2) {
    return res.status(400).send("State must be a two letter abreviation");
  }
  console.log(typeof zip);
  numbers = /^[0-9]+$/;
  if (!zip.match(numbers) || zip.length != 5) {
    res.status(400).send("zip code must be a 5 digit number");
  }
  const id = uuid();
  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip
  };

  addresses.push(newAddress);

  res
    .status(201)
    .location(`http://localhost:8000/user/${id}`)
    .json(newAddress);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

app.delete("/address/:id", (req, res) => {
  const { id } = req.params;
  const index = addresses.findIndex(address => address.id === id);
  if (req.headers.authorization != `Bearer ${token}`) {
    res.status(404).send("incorrect authorization token or method");
  }

  if (index === -1) {
    return res.status(404).send("Address not found");
  }

  addresses.splice(index, 1);

  res.send("Deleted");
});

module.exports = app;
