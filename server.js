const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("./config/passport");

const app = express();
const PORT = 9000;
console.log(process.env.NODE_ENV==='production');

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

const allowedOrigins = [
  "http://localhost:3000",
  "https://www.spacefordevelopers.in",
  "https://spacefordevelopersbackend-production.up.railway.app",
];

app.use(cookieParser());
app.set('trust proxy', 1); // Trust first proxy
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request Origin:", origin); // Log the requesting origin

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin); // Log blocked origin
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Allows cookies & sessions to be sent
  })
);


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Store this in .env
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Store sessions in MongoDB
      collectionName: "sessions",
    }),
    
    cookie: {
      httpOnly: true,
      secure: false, // ✅ Secure in production (HTTPS)
      sameSite:  "lax" , // ✅ Cross-site in production, safer in dev
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },

  })
);


app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/user", userRouter);

app.listen(PORT, () => {
  console.log("Server started on PORT:", PORT);
});
