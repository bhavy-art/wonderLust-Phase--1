const mongodb = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const { default: mongoose } = require("mongoose");

main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderLust");
};

const initDb = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj, owner: "6a47da3d65d488c90b6aa310",
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDb();
