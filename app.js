const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listings = require('./routes/listing.js')

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}



const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// ----------------------------
// Index Route
// ----------------------------
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listings);

// -------------------------------
// Post Review
// -------------------------------
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("New Review Saved ");
    res.redirect(`/listings/${listing._id}`);
  })
);

// ----------------------------
// Delete Review
// ----------------------------
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  })
);

// ----------------------------
// Just for Testing Purpose
// ----------------------------
// app.get("/testListing", (req, res) => {
//   const sampleListing = new Listing({
//     title: "Beautiful Beach House",
//     description: "A lovely beach house with stunning ocean views and modern amenities.",
//     price: 350000,
//     location: "Madgaon, Goa",
//     country: "India",
//   });

//   sampleListing.save().then((result)=>{
//     console.log(result);
//     console.log("Sample was saved");
//     res.send("Successful testing");
//   });
// });

// -------------------------------
// Page Not Found
// -------------------------------
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// -------------------------------
// Error Handling Middleware
// -------------------------------
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { statusCode, message });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
