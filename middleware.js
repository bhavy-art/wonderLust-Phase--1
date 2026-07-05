const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js")

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create a listings");
    return res.redirect("/login");
  }
  next();
};


module.exports.savedRedirectUrl = (req, res, next) => {
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}


module.exports.isOwner = async(req, res, next) =>{
   let {id} = req.params;
    let listing  = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error", "you are not the owner of this listing");
      return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
};


// module.exports.validateReview = (req, res, next) => {
//   let {error} = reviewSchema.validate(req.body);
//   if(error){
//     let errMsg = error.details.map((el)=>el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   }else{
//     next();
//   }
// };

module.exports.validateReview = (req, res, next) => {
    console.log(req.body);
    console.log(typeof req.body.review.rating);

    let { error } = reviewSchema.validate(req.body);

    if (error) {
        console.log(error.details);
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    next();
};


module.exports.isReviewAuthor = async(req, res, next) =>{
   let {id, reviewId} = req.params;
    let review  = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
      req.flash("error", "you are not the author of this review");
      return res.redirect(`/listings/${id}`);
    }
    next();
}




// const Listing = require("./models/listing");
// const Review = require("./models/review");
// const { listingSchema } = require("./schema.js");
// const ExpressError = require("./utils/ExpressError.js");
// const { reviewSchema } = require("./schema.js");
// module.exports.isLoggedIn = (req, res, next) => {
//     // console.log(req.path, "..", req.originalUrl);
//     if (!req.isAuthenticated()) {
//         //redirect URL save
//         req.session.redirectUrl = req.originalUrl;
//         req.flash("error", "you must be logged in to create listings");
//         return res.redirect("/login");
//     }
//     next();
// }
// module.exports.saveRedirectUrl = (req, res, next) => {
//     if (req.session.redirectUrl) {
//         res.locals.redirectUrl = req.session.redirectUrl;

//     }
//     next();
// }
// module.exports.isOwner = async (req, res, next) => {
//     let { id } = req.params;

//     let listing = await Listing.findById(id); // ✅ add await

//     // ✅ check if current user is owner
//     if (!listing.owner.equals(req.user._id)) {
//         req.flash("error", "You don't have permission to edit");
//         return res.redirect(`/listings/${id}`);
//     }
//     next();

// };
// module.exports.validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);

//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }

// };
// module.exports.validateReview = ((req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);

//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }

// });
// module.exports.isReviewAuthor = async (req, res, next) => {
//     let { id, reviewId } = req.params;

//     let review = await Review.findById(reviewId); // ✅ add await

//     // ✅ check if current user is owner
//     if (!review.author.equals(req.user._id)) {
//         req.flash("error", "you are not the author of this review");
//         return res.redirect(`/listings/${id}`);
//     }
//     next();

// };