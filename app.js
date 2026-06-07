const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const { title } = require("node:process");
const path = require("path");

main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
});


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderLust");
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));


app.get("/",(req,res)=>{
    res.send("hii, I am root");
});

app.get("/listing",async (req,res)=>{
    const allListing = await Listing.find({});
    console.log(allListing);
    res.render("listings/index.ejs",{allListing});
});

// app.get("/testlisting", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new vila",
//         description: "By the beach",
//         price: 1200,
//         location: "Calanguta, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfull testing");
// });

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});