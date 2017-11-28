import mongoose, { Schema } from "mongoose";

const recipeSchema = new Schema({
  name: { type: String, required: true },
  author: {
    name: String,
    _id: Schema.Types.ObjectId
  },
  requiredTime: {
    prepTime: Number,
    cookTime: Number
  },
  ingredients: [
    {
      amount: Number,
      mesaurement: String,
      name: String
    }
  ],
  instructions: [String],
  likes: { type: Number, default: 0 },
  ratings: [
    {
      rater: Schema.Types.ObjectId,
      rating: Number
    }
  ],
  averageRating: Number
});

export default mongoose.model("Recipe", recipeSchema);
