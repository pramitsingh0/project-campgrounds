const express = require("express");
const Router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const Review = require("../models/reviews");
const { reviewValidateSchema } = require("../campValidateSchema");
const ExpressError = require("../utils/ExpressError");
const asyncError = require("../utils/asyncError");

const validateReview = (req, res, next) => {
  const { error } = reviewValidateSchema.validate(req.body);
  if (error) {
    const mssg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(mssg, 400);
  } else {
    next();
  }
};

Router.post(
  "/",
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
Router.delete(
  "/:reviewId",
  asyncError(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);
module.exports = Router;
