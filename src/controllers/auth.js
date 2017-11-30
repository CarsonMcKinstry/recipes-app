import User from "../models/user";
import { encode as encodeJwt } from "jwt-simple";
import { pick, get, pipe } from "lodash/fp";
import validator from "validator";

const jwtSecret = process.env.JWT_SECRET;

const tokenFromUser = user => {
  const payload = pick(["email", "screenName", "_id"])(user);
  return encodeJwt(payload, jwtSecret);
};

export const registerUser = (req, res, next) => {
  const { email, password, screenName } = pipe([
    get("body"),
    pick(["email", "password", "screenName"])
  ])(req);

  const trimmedEmail = validator.trim(email);
  const trimmedPassword = validator.trim(password);
  const trimmedName = validator.trim(screenName);

  if (!validator.isEmail(trimmedEmail) || !trimmedEmail)
    return res.status(400).send("You must provide a valid email address");

  if (
    !trimmedPassword ||
    trimmedPassword.length < process.env.PASSWORD_MIN_LENGTH
  )
    return res
      .status(400)
      .send(
        `You must provide a password longer than ${
          process.env.PASSWORD_MIN_LENGTH
        } characters`
      );

  if (!trimmedName)
    return res.status(400).send("You must provide a screen name");

  User.findOne({ email: trimmedEmail }, (err, foundUser) => {
    if (err) return next(err);
    if (foundUser)
      return res.status(409).send("A user with that email already exists.");

    const newUser = new User();

    newUser.email = trimmedEmail;
    newUser.password = newUser.generateHash(trimmedPassword);
    newUser.screenName = trimmedName;

    newUser.save((err, user) => {
      if (err) return next(err);
      if (user) return res.json({ token: tokenFromUser(user) });
    });
  });
};

export const login = (req, res, next) => {
  res.send({ token: tokenFromUser(req.user) });
};
