require("dotenv").config();
const mongoose = require("mongoose");

console.log(process.env.ATLASDB_URL);

mongoose
  .connect(process.env.ATLASDB_URL)
  .then(() => {
    console.log("Connected!");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });