const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js")
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");

const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
};

// Index Route
router.get("/", wrapAsync(async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index", { allListing });
}));

// New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
router.get("/:id", wrapAsync( async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if(!listing){
    req.flash("error", "listing you requested for does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show", { listing });
}));

// Create Route
router.post("/", validateListing, isLoggedIn, wrapAsync( async (req, res, next) => {
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
        req.flash("success", "New Listing Created Successfully!");
        res.redirect("/listings");
  // }catch(err){
  //   next(err);
  // }
  
}));


// edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
    req.flash("error", "listing you requested for does not exist");
    res.redirect("/listings");
  }
    res.render("listings/edit.ejs",{listing});
}));


// update route
router.put("/:id", validateListing, isLoggedIn, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Updated")
    res.redirect(`/listings/${id}`);
}));


// delete route
router.delete("/:id", isLoggedIn, wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted")
    res.redirect("/listings");
}));


module.exports = router;