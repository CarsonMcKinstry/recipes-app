import mongoose, { Schema } from "mongoose";
import { hashSync, compareSync, genSaltSync } from "bcrypt-nodejs";

const userSchema = new Schema({
  screenName: String,
  email: { type: String, unique: true, lowercase: true },
  password: String
});

userSchema.methods.generateHash = password => {
  return hashSync(password, genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return compareSync(password, this.password);
};

export default mongoose.model("User", userSchema);
