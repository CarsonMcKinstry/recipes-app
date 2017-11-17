import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as jwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/user";

import { now } from "moment";

const jwtSecret = process.env.JWT_SECRET;

export default passport => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // local login
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        // change the username field to fit your needs
        passwordField: "password",
        passReqToCallback: true
      },
      (req, email, password, done) => {
        // remember to change this to check for what your username field is
        User.findOne({ email: email }, (err, user) => {
          if (err) return done(err);
          if (!user) return done(null, false);

          return done(null, user.validPassword(password) ? user : false);
        });
      }
    )
  );

  // jwt login
  passport.use(
    "jwt-login",
    new jwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromHeader("authorization"),
        secretOrKey: jwtSecret
      },
      (payload, done) => {
        User.findById(payload._id, (err, user) => {
          if (err) return done(err, false);

          return done(null, user ? user : false);
        });
      }
    )
  );
};
