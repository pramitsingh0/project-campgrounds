const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const ejsMate = require("ejs-mate");
const asyncError = require("./utils/asyncError");
const ExpressError = require("./utils/ExpressError");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

async function db() {
  await mongoose.connect("mongodb://localhost:27017/project-campground");
}

mongoose.set("strictQuery", false);
// Connect to DB
db()
  .then(() => {
    console.log("Connected to db!");
  })
  .catch((e) => {
    console.error("Connection to db error: ", e);
  });

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("campgrounds/home");
});
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});
app.get("/campgrounds/new", (req, res) => res.render("campgrounds/newcamp"));

app.get("/campgrounds/:id", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { campground });
});

app.post(
  "/campgrounds/save",
  asyncError(async (req, res, next) => {
    if (!req.body.campground) throw new ExpressError("Invalid input", 400);
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);

//EDIT
app.get("/campgrounds/:id/edit", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/update", { campground });
});
app.put(
  "/campgrounds/:id/update",
  asyncError(async (req, res, next) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground, {
      new: true,
    });
    res.redirect(`/campgrounds/${req.params.id}`);
  })
);

//DELETE
app.delete("/campgrounds/:id", async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  res.redirect("/campgrounds");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  const { statuscode = 500, message = "Something went wrong" } = err;
  res.status(statuscode).render("error404");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
