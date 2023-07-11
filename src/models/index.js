"use strict";

const { Sequelize, DataTypes } = require("sequelize");
const clothesModel = require("./clothes/model");
const foodModel = require("./food/model");
const Collection = require("./data-collection.js");
const userModel = require("../auth/models/users");

const POSTGRES_URI =
  process.env.NODE_ENV === "test"
    ? "sqlite::memory:"
    : process.env.DATABSAE_URL;
let sequelizeOptions =
  process.env.NODE_ENV === "production"
    ? {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
    : {}; //the empty object

let sequelize = new Sequelize(POSTGRES_URI, sequelizeOptions);

const food = foodModel(sequelize, DataTypes);
const clothes = clothesModel(sequelize, DataTypes);
module.exports = {
  db: sequelize,
  food: new Collection(food),
  clothes: new Collection(clothes),
  users: userModel(sequelize, DataTypes),
};
