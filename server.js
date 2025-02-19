const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRouter=require("./routes/user")
require("dotenv").config();

const app=express();
const PORT=9000;

mongoose.connect(process.env.MONGO_URI).then(()=>console.log("DB connected")).catch((err)=>console.log(err));
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.spacefordevelopers.in",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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