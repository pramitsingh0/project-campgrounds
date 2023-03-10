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
const campgroundRoutes = require("./routes/campgrounds");
const {
  campValidatorSchema,
  reviewValidateSchema,
} = require("./campValidateSchema");
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
app.use("/campgrounds", campgroundRoutes);

const validateReview = (req, res, next) => {
  const { error } = reviewValidateSchema.validate(req.body);
  if (error) {
    const mssg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(mssg, 400);
  } else {
    next();
  }
};

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
