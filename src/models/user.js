import mongoose, { Schema } from "mongoose";
import { hashSync, compareSync, genSaltSync } from "bcrypt-nodejs";

const userSchema = new Schema(
  {
    screenName: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true },
    password: String
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

userSchema.methods.generateHash = password => {
  return hashSync(password, genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return compareSync(password, this.password);
};

export default mongoose.model("User", userSchema);
