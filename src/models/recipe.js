import mongoose, { Schema } from "mongoose";

const recipeSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 60 },
    normalizedName: { type: String, index: true },
    description: { type: String, maxlength: 140 },
    author: {
      screenName: String,
      _id: Schema.Types.ObjectId
    },
    requiredTime: {
      prepTime: Number,
      cookTime: Number
    },
    ingredients: {
      type: [
        {
          amount: Number,
          measurement: String,
          name: {
            type: String,
            required: true,
            maxlength: 26,
            index: true
          }
        }
      ],
      required: true
    },
    instructions: { type: [{ type: String, maxlength: 300 }], required: true },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    ratings: [
      {
        rater: Schema.Types.ObjectId,
        rating: {
          type: Number,
          min: 1,
          max: 5
        }
      }
    ],
    averageRating: Number,
    displayImage: String,
    keywords: { type: [String], index: true },
    tags: { type: [String], index: true }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export default mongoose.model("Recipe", recipeSchema);
