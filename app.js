const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/reviews");
const ejsMate = require("ejs-mate");
const asyncError = require("./utils/asyncError");
const ExpressError = require("./utils/ExpressError");
const {
  campValidatorSchema,
  reviewValidateSchema,
} = require("./campValidateSchema");
const campground = require("./models/campground");
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
  const campground = await Campground.findById(req.params.id).populate(
    "reviews"
  );
  res.render("campgrounds/show", { campground });
});
const validateCamp = (req, res, next) => {
  const { error } = campValidatorSchema.validate(req.body);
  if (error) {
    const mssg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(mssg, 400);
  } else {
    next();
  }
};
const validateReview = (req, res, next) => {
  const { error } = reviewValidateSchema.validate(req.body);
  if (error) {
    const mssg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(mssg, 400);
  } else {
    next();
  }
};

app.post(
  "/campgrounds/save",
  validateCamp,
  asyncError(async (req, res, next) => {
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
  validateCamp,
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
// CREATE REVIEW
app.post(
  "/campgrounds/:id/review",
  validateReview,
  asyncError(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    console.log(camp);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp.id}`);
  })
);
app.delete(
  "/campgrounds/:id/review/:reviewId",
  asyncError(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
// ERROR HANDLER
app.use((err, req, res, next) => {
  const { statuscode = 500, message = "Something went wrong" } = err;
  res
    .status(statuscode)
    .render("error404", { statuscode: statuscode, message: message });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
