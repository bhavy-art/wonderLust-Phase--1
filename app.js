const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderLust");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
};

// Home Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index", { allListing });
}));

// New Route
app.get("/listing/new", (req, res) => {
  res.render("listings/new");
});

// Show Route
app.get("/listings/:id", wrapAsync( async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  res.render("listings/show", { listing });
}));

// Create Route
app.post("/listings", validateListing, wrapAsync( async (req, res, next) => {
  // try{
    // if(!req.body.listing){
    //   throw new ExpressError(400,"Send valid data for listing");
    // }
    let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
      throw new ExpressError(404,result.error);
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  // }catch(err){
  //   next(err);
  // }
  
}));


// edit route
app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));


// update route
app.put("/listings/:id", validateListing, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));


// delete route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
}));
 

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

app.all("/*splat",(req,res,next)=>{
  next(new ExpressError(404,"page not found"));
});

app.use((err,req,res,next)=>{
  // res.send("Something went wrong");
  let {statusCode = 500, message = "Something went wrong"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});