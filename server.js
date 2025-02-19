const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRouter=require("./routes/user")
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app=express();
const PORT=9000;
mongoose.connect(process.env.MONGO_URI).then(()=>console.log("DB connected")).catch((err)=>console.log(err));
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.spacefordevelopers.in",
  "https://spacefordevelopersbackend-production.up.railway.app"
];


app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    console.log("Request Origin:", origin); // Log the requesting origin

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin); // Log blocked origin

      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.urlencoded({extended:false}));
app.use(express.json());  





app.use("/api/v1/user", userRouter);











app.listen(PORT,()=>{
    console.log("server started !!");
})