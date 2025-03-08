const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    console.error(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); // ✅ Enable PUT & DELETE requests
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

// Root Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Index Route
app.get("/listings", async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.render("listings/index", { allListings: listings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// New Listing Form Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

// Show Route
// app.get("/listings/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const listing = await Listing.findById(id);
//     if (!listing) {
//       return res.status(404).send("Listing not found");
//     }
//     res.render("listings/show", { listing });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// });



// Create Route
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect(`/listings/${newListing._id}`);
});

// Edit Form Route
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/edit", { listing });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Update Route (Fix: Use await & new: true)
app.put("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    // await Listing.findByIdAndUpdate(
    //   id,
    //   { 
    //     ...req.body.listing, 
    //     image: { url: req.body.image, fileName: "file" } 
    //   },
    //   { new: true }
      
    // );
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating listing");
  }
});

// Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

// Show Route
app.get("/listings/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const listing = await Listing.findById(id);
      if (!listing) {
        return res.status(404).send("Listing not found");
      }
      res.render("listings/show", { listing });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  });

// Start the Server
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});