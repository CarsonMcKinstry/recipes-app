import User from "../models/user";
import crypto from "crypto";
import { encode as encodeJwt } from "jwt-simple";
import { pick, get, pipe } from "lodash/fp";
import validator from "validator";
import { now } from "moment";

const jwtSecret = process.env.JWT_SECRET;

const tokenFromUser = user => {
  const payload = pick(["email", "screenName", "_id"])(user);
  return encodeJwt(payload, jwtSecret);
};

const handleErrors = res => (status, message) => {
  return res.status(status).send(message);
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

export const login = (req, res) => {
  res.send({ token: tokenFromUser(req.user) });
};

export const getResetToken = (req, res) => {
  const cipher = crypto.createCipher(
    "aes-128-cbc",
    process.env.ENCRYPTION_SECRET
  );
  // an email will be sent with a link?
  const { email, _id } = req.user;
  const iat = now() + 10 * 60 * 1000;

  const encrypted =
    cipher.update(`${_id}-${email}-${iat}`, "utf8", "hex") +
    cipher.final("hex");

  return req.user
    .update({ passwordReset: encrypted })
    .then(_ => res.send({ success: true, encrypted }));
};

export const handleResetToken = (req, res) => {
  const decipher = crypto.createDecipher(
    "aes-128-cbc",
    process.env.ENCRYPTION_SECRET
  );
  const { token } = req.query;
  const { password, passwordConfirm } = req.body;
  const decrypted =
    decipher.update(token, "hex", "utf8") + decipher.final("utf8");
  const [_id, email, iat] = decrypted.split("-");

  if (iat < now()) return handleErrors(res)(403, "Your token has expired");
  if (password !== passwordConfirm)
    return handleErrors(res)(400, "Passwords must match");

  User.findOne({ _id, email })
    .then(user => {
      if (!user) throw { status: 404, message: "User not found" };
      if (user && !user.passwordReset)
        throw { status: 403, message: "Invalid token" };
      return user.update(
        {
          password: user.generateHash(password),
          $unset: { passwordReset: "" }
        },
        { new: true }
      );
    })
    .then(_ => {
      return res.json({ success: true });
    })
    .catch(err => {
      console.log(err);
      return handleErrors(res)(err.status || 500, err.message || "");
    });
};
