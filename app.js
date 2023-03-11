const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/review");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("public", path.join(__dirname, "public"));
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/review", reviewRoutes);
app.use(express.static("public"));
const sessionConfig = {
  secret: "somesecret",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  resave: false,
  saveUninitialized: true,
};
app.use(session(sessionConfig));

// DB CONNECTION
async function db() {
  await mongoose.connect("mongodb://localhost:27017/project-campground");
}

mongoose.set("strictQuery", false);
db()
  .then(() => {
    console.log("Connected to db!");
  })
  .catch((e) => {
    console.error("Connection to db error: ", e);
  });

// CREATE REVIEW

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
