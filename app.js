const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const Listing = require("./models/listing.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

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

app.get("/testListing", (req, res) => {
  const sampleListing = new Listing({
    title: "Beautiful Beach House",
    description: "A lovely beach house with stunning ocean views and modern amenities.",
    price: 350000,
    location: "Madgaon, Goa",
    country: "India",
  });

  sampleListing.save().then((result)=>{
    console.log(result);
    console.log("Sample was saved");
    res.send("Successful testing"); 
  }); 
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
