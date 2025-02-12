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

const listings = require("./routes/listing.js");
const review = require("./models/review.js");

const reviews = require("./routes/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"

main().then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("Hi,I'm root !");
});



app.use("/listings",listings);
app.use("/listings/:id/reviews", reviews)

  

// app.get("/testListing", async (req, res)=>{
//     let sampleL = new Listing({
//         title:"My new Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleL.save();
//     console.log("sample was saved");
//     res.send("successful");
// });

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
