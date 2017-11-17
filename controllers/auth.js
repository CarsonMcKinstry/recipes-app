import User from "../models/user";
import { encode as encodeJwt } from "jwt-simple";
import { pick, get } from "lodash";
import validator from "validator";

const jwtSecret = process.env.JWT_SECRET;

const tokenFromUser = user => {
  const payload = {};

  payload.email = get(user, "email");
  payload._id = get(user, "_id");

  return encodeJwt(payload, jwtSecret);
};

export const registerUser = (req, res, next) => {
  const { email, password } = pick(req.body, ["email", "password"]);

  const trimmedEmail = validator.trim(email);
  const trimmedPassword = validator.trim(password);

  if (!validator.isEmail(trimmedEmail) || !trimmedEmail)
    return res.status(400).send("You must provide a valid email address");

  if (
    !trimmedPassword ||
    trimmedPassword.length < process.env.PASSWORD_MIN_LENGTH
  )
    return res
      .status(400)
      .send(
        `You must provide a password longer than ${process.env
          .PASSWORD_MIN_LENGTH} characters`
      );

  User.findOne({ email: trimmedEmail }, (err, foundUser) => {
    if (err) return next(err);
    if (foundUser)
      return res.status(409).send("A user with that email already exists.");

    const newUser = new User();

    newUser.email = trimmedEmail;
    newUser.password = newUser.generateHash(trimmedPassword);

    newUser.save((err, user) => {
      if (err) return next(err);
      if (user) return res.json({ token: tokenFromUser(user) });
    });
  });
};

export const login = (req, res, next) => {
  res.send({ token: tokenFromUser(req.user) });
};
