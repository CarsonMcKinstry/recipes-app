// Server gen
import express from "express";
import { createServer } from "http";
import router from "./src/routes/";

// Basic middleware
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import passport from "passport";
import passportConfig from "./src/config/passport";

// mongodb interfacing
import mongoose from "mongoose";
import bluebird from "bluebird";
import dbUrl from "./src/config/database";

mongoose.Promise = bluebird;
mongoose.connect(dbUrl, { useMongoClient: true }, err => {
  if (err) throw err;
  console.log("Successfully connected to mongodb");
});

const port = process.env.PORT || 3000;
const app = express();

// set up middleware
// comment lines to exclude them
app.use(cors());
app.use(morgan(process.env.LOG_LEVEL));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
passportConfig(passport);

router(app, passport);

const server = createServer(app);

server.listen(port, () => console.log(`Server started on port ${port}`));
