if(process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./public/js/ExpressError.js");
const { listingSchema, reviewSchema, } = require("./schema.js");
const Review = require("./models/review.js");

const listingRouter = require("./routes/listing.js");
const review = require("./models/review.js");

const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

store.on("error", function(e){
  console.log("ERROR IN MONGO SESSION STORE",e);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000*60*60*24*7,
    maxAge: 1000*60*60*24*7,
    httpOnly: true,
  },
};
// ttl - maximum lieftime of a session in milliseconds by default is 14 days

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24*60*60,  //time interval between session updates in seconds
});


app.use(session(sessionOptions));
app.use(flash()); //we'll use our routes first.

//passport uses the sessions middleware.
app.use(passport.initialize());
app.use(passport.session()); // A series of requests and responses each associated with same user is known as session
passport.use(new LocalStrategy(User.authenticate())); //users will get autheticated through local strategy by a static method .authenticate.
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/demouser", async (req,res)=>{
  let fakeUser = new User({
    email: "student@gmail.com",
    username: "delta-student"
  });

  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
})


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews", reviewRouter)
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page Not Found!"));
});

app.use((next,req,res,err)=>{
  let {statusCode=500,message="Something went wrong"} = err;
  // res.status(statusCode).send(message);
  res.render("error.ejs");
});
app.listen(8080,()=>{
    console.log("server is listening to port 8080")
});
