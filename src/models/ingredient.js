import mongoose, { Schema } from "mongoose";

const ingredientSchema = new Schema({
  name: { type: String, unique: true }
});

export default mongoose.model("Ingredient", ingredientSchema);
