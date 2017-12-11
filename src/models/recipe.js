import mongoose, { Schema } from "mongoose";

const recipeSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 60 },
    normalizedName: { type: String, index: true },
    description: { type: String, maxlength: 280 },
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
    instructions: { type: [{ type: String, maxlength: 1000 }], required: true },
    likes: {
      type: [
        {
          _id: { type: Schema.ObjectId, unique: true },
          screenName: String
        }
      ]
    },
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
    tags: { type: [String], index: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export default mongoose.model("Recipe", recipeSchema);
