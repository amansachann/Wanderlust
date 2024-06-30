const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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

app.get("/", (req, res) => {
  res.send("Hi, I am root...");
});

// ----------------------------
// Index Route
// ----------------------------
app.get("/listings", (req, res) => {
  Listing.find({})
    .then((allListings) => {
      res.render("listings/index.ejs", { allListings });
    })
    .catch((err) => console.log(err));
});

// ----------------------------
// New Route
// ----------------------------
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// ----------------------------
// Show Route
// ----------------------------
app.get("/listings/:id", (req, res) => {
  const { id } = req.params;
  Listing.findById(id)
    .then((listing) => {
      res.render("listings/show.ejs", { listing });
    })
    .catch((err) => {
      console.log(err);
    });
});

// ------------------------------
// Create Route - Aman Version
// ------------------------------
app.post("/listings", (req, res) => {
  const listing = req.body.listing;
  const newListing = new Listing(listing);
  newListing
    .save()
    .then((result) => {
      console.log("New Listing Added");
      console.log(result);
      res.redirect("/listings");
    })
    .catch((err) => {
      console.log(err);
    });
});

// -------------------------------
// Create Route - Sraddha Version
// -------------------------------
// app.post("/listings", async (req, res) => {
//   const newListing = new Listing(req.body.listing);
//   await newListing.save();
//   res.redirect("/listings");
// });

// -------------------------------
// Edit Route
// -------------------------------
app.get("/listings/:id/edit", (req, res) => {
  const { id } = req.params;
  Listing.findById(id)
    .then((listing) => {
      res.render("listings/edit.ejs", { listing });
    })
    .catch((err) => {
      console.log(err);
    });
});

// -------------------------------
// Edit Route - Sraddha Version
// -------------------------------
// app.get("/listings/:id/edit", async (req, res) => {
//   const { id } = req.params;
//   const listing = await  Listing.findById(id);
//   res.render("listings/edit.ejs", { listing });
// });

// -------------------------------
// Update Route
// -------------------------------
app.put("/listings/:id", (req, res) => {
  const { id } = req.params;
  Listing.findByIdAndUpdate(id, { ...req.body.listing })
    .then(() => {
      console.log("Listing Updated");
      res.redirect(`/listings/${id}`);
    })
    .catch((err) => {
      console.log(err);
    });
});

// -------------------------------
// Update Route - Sraddha Version
// -------------------------------
// app.put("/listings/:id", async (req, res) => {
//   const { id } = req.params;
//   await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//   res.redirect(`/listings/${id}`);
// });

// -------------------------------
// Delete Route
// -------------------------------
app.delete("/listings/:id", (req, res) => {
  const { id } = req.params;
  Listing.findByIdAndDelete(id)
    .then((deletedListing) => {
      console.log("Listing Deleted");
      console.log(deletedListing);
      res.redirect("/listings");
    })
    .catch((err) => {
      console.log(err);
    });
});

// -------------------------------
// Delete Route - Sraddha Version
// -------------------------------
// app.delete("/listings/:id", async (req, res) => {
//   const { id } = req.params;
//   const deletedListing = await Listing.findByIdAndDelete(id);
//   console.log(deletedListing);
//   res.redirect("/listings");
// });

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
