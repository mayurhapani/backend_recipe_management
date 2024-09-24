import mongoose, { Schema } from "mongoose";

const recipeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    ingredients: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "AMERICAN",
        "THAI",
        "ITALIAN",
        "ASIAN",
        "MEXICAN",
        "FRENCH",
        "INDIAN",
        "CHINESE",
        "JAPANESE",
      ],
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    cookingTime: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const recipeModel = mongoose.model("Recipe", recipeSchema);
