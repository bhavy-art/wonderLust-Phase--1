const Listing = require("../models/listing");
const axios = require("axios");

// module.exports.index = async (req, res) => {
//   const allListing = await Listing.find({});
//   res.render("listings/index", { allListing });
// };


// module.exports.index = async (req, res) => {
//     const { category } = req.query;

//     let allListing;

//     if (category) {
//         allListing = await Listing.find({ category: category });
//     } else {
//         allListing = await Listing.find({});
//     }

//     res.render("listings/index", { allListing });
// };

// module.exports.index = async (req, res) => {
//     const { category } = req.query;

//     let allListing;

//     if (category) {
//         allListing = await Listing.find({ category });
//     } else {
//         allListing = await Listing.find({});
//     }

//     res.render("listings/index", {
//         allListing,
//         selectedCategory: category,
//     });
// };


module.exports.index = async (req, res) => {
    const { category, search } = req.query;

    let filter = {};

    // Category filter
    if (category) {
        filter.category = category;
    }

    // Search filter
    // if (search) {
    //     filter.$or = [
    //         { title: { $regex: search, $options: "i" } },
    //         { location: { $regex: search, $options: "i" } },
    //         { country: { $regex: search, $options: "i" } },
    //     ];
    // }


    if (search) {
    filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
    ];

    // If search is a number, search by price
    const price = Number(search);

        if (!isNaN(price)) {
            filter.$or.push({
                price: { $lte: price }
            });
        }
    }

    const allListing = await Listing.find(filter);

    res.render("listings/index", {
        allListing,
        selectedCategory: category,
    });
};


module.exports.renderNewForm =  (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing =  async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews",populate: { path: "author"},}).populate("owner");
  if(!listing){
    req.flash("error", "listing you requested for does not exist");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show", { listing });
};



// module.exports.createListing = async (req, res) => {
//     let url = req.file.path;
//     let filename = req.file.filename;

//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = {url, filename};
//     await newListing.save();

//     req.flash("success", "New Listing Created Successfully!");
//     res.redirect("/listings");
// };

// module.exports.createListing = async (req, res) => {
//     let url = req.file.path;
//     let filename = req.file.filename;

//     // Geocode the location
//     const response = await axios.get(
//         "https://api.geoapify.com/v1/geocode/search",
//         {
//             params: {
//                 text: `${req.body.listing.location}, ${req.body.listing.country}`,
//                 apiKey: process.env.GEOAPIFY_API_KEY,
//             },
//         }
//     );

//     const coordinates = response.data.features[0].geometry.coordinates;

//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = { url, filename };

//     // Save coordinates
//     newListing.geometry = {
//         type: "Point",
//         coordinates: coordinates,
//     };

//     await newListing.save();

//     req.flash("success", "New Listing Created Successfully!");
//     res.redirect("/listings");
// };



module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const response = await axios.get(
        "https://api.geoapify.com/v1/geocode/search",
        {
            params: {
                text: `${req.body.listing.location}, ${req.body.listing.country}`,
                apiKey: process.env.GEOAPIFY_API_KEY,
            },
        }
    );

    if (!response.data.features.length) {
        req.flash("error", "Invalid location.");
        return res.redirect("/listings/new");
    }

    const coordinates = response.data.features[0].geometry.coordinates;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = {
        type: "Point",
        coordinates: coordinates,
    };

    await newListing.save();

    req.flash("success", "New Listing Created Successfully!");
    res.redirect("/listings");
};


// module.exports.createListing = async (req, res) => {

//     const location = req.body.listing.location;

//     let lat = null;
//     let lng = null;

//     try {
//         const response = await axios.get(
//             `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
//             {
//                 headers: {
//                     "User-Agent": "Wanderlust"
//                 }
//             }
//         );

//         if (response.data.length > 0) {
//             lat = response.data[0].lat;
//             lng = response.data[0].lon;
//         }
//     } catch (err) {
//         console.log("Geocoding Error:", err);
//     }

//     const newListing = new Listing(req.body.listing);

//     newListing.owner = req.user._id;

//     newListing.geometry = {
//         lat,
//         lng,
//     };

//     if (req.file) {
//         newListing.image = {
//             url: req.file.path,
//             filename: req.file.filename
//         };
//     }

//     await newListing.save();

//     req.flash("success", "New Listing Created");
//     res.redirect(`/listings/${newListing._id}`);
// };



module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
    req.flash("error", "listing you requested for does not exist");
    res.redirect("/listings");
  }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_200");
    res.render("listings/edit.ejs",{listing, originalImageUrl});
};




module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
}


module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted")
    res.redirect("/listings");
};