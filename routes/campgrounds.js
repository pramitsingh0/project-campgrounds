const express = require("express");
const router = express.Router();
const { campValidatorSchema } = require("../campValidateSchema");
const ExpressError = require("../utils/ExpressError");
const asyncError = require("../utils/asyncError");
const Campground = require("../models/campground");

const validateCamp = (req, res, next) => {
  const { error } = campValidatorSchema.validate(req.body);
  if (error) {
    const mssg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(mssg, 400);
  } else {
    next();
  }
};

router.get("/", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

router.get("/new", (req, res) => res.render("campgrounds/newcamp"));

router.get("/:id", async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate(
    "reviews"
  );
  res.render("campgrounds/show", { campground });
});

router.post(
  "/save",
  validateCamp,
  asyncError(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);

//EDIT
router.get("/:id/edit", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/update", { campground });
});

router.put(
  "/:id/update",
  validateCamp,
  asyncError(async (req, res, next) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground, {
      new: true,
    });
    res.redirect(`/campgrounds/${req.params.id}`);
  })
);

//DELETE
router.delete("/:id", async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  res.redirect("/campgrounds");
});

module.exports = router;
