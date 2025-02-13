const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRouter=require("./routes/user")

const app=express();
const PORT=8000;

mongoose.connect("mongodb://localhost:27017/").then(()=>console.log("DB connected")).catch((err)=>console.log(err));

app.use(cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true, // Allows sending cookies
  }));

app.use(express.urlencoded({extended:false}));
app.use(express.json());  





app.use("/api/v1/user", userRouter);











app.listen(PORT,()=>{
    console.log("server started !!");
})