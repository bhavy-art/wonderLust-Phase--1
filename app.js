const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const Review = require("./models/review.js");
// const {listingSchema, reviewSchema} = require("./schema.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");


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

// session
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,   
  },
};


// Home Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});



app.use(session(sessionOptions));
app.use(flash());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})



// routers for listing and review page
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews)






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