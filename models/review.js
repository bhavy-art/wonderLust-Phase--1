const { number } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    name: {
        type: String,
    },
    comment:{
        type: String,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});


// module.exports = mongoose.model("Review",reviewSchema);
module.exports = mongoose.model("Review", reviewSchema);