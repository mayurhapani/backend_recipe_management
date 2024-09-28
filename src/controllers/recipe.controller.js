import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import path from "path";
import fastCsv from "fast-csv";
import { fileURLToPath } from "url";
import { readCSVFile, deleteFile } from "../helpers/fileHelper.js";
import { recipeModel } from "../models/recipe.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addRecipe = asyncHandler(async (req, res) => {
  const { title, ingredients, type, instructions, cookingTime, image } = req.body;
  const userId = req.user._id;

  if ([title, ingredients, type, instructions, cookingTime, image].some((field) => field?.toString().trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const newRecipe = await recipeModel.create({
    title,
    ingredients,
    type,
    instructions,
    cookingTime,
    image,
    createdBy: userId,
  });

  if (!newRecipe) {
    throw new ApiError(500, "Something went wrong while adding recipe");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newRecipe, "New Recipe added successfully"));
});

const deleteRecipe = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  const recipe = await recipeModel.findById(_id);

  if (!recipe) throw new ApiError(404, "Recipe not found");

  const deletedRecipe = await recipeModel.findByIdAndDelete(_id);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedRecipe, "Recipe deleted successfully"));
});

const updateRecipe = asyncHandler(async (req, res) => {
  const { title, ingredients, type, instructions, cookingTime, image } = req.body;
  const { _id } = req.params;

  const recipe = await recipeModel.findById(_id);

  if (!recipe) {
    throw new ApiError(404, "Recipe not found");
  }

  if (recipe.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this recipe");
  }

  recipe.title = title;
  recipe.ingredients = ingredients;
  recipe.type = type;
  recipe.instructions = instructions;
  recipe.cookingTime = cookingTime;
  if (image) {
    recipe.image = image;
  }

  const updatedRecipe = await recipe.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecipe, "Recipe updated successfully"));
});

const getRecipes = asyncHandler(async (req, res) => {
  const { page = 1, filters = {} } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;
  let query = {};

  if (filters.type) {
    query.type = filters.type;
  }

  const user = req.user;

  if (user.role !== "admin") {
    query.createdBy = user._id;
  }

  const recipes = await recipeModel
    .find(query)
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name");

  return res.json(
    new ApiResponse(200, recipes, "Recipes retrieved successfully")
  );
});

const importRecipes = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "File not found. Please upload a CSV file.");
  }

  const filePath = path.join(__dirname, `../uploads/${req.file.filename}`);

  try {
    const tasks = await readCSVFile(filePath);

    const formattedTasks = await Promise.all(
      tasks.map(async (task) => {
        const createdByUser = await userModel.findOne({ name: task.createdBy });

        if (!createdByUser) {
          throw new ApiError(400, "Invalid user in createdBy");
        }

        return {
          ...task,
          createdBy: createdByUser._id,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        };
      })
    );

    await recipeModel.insertMany(formattedTasks);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Tasks imported successfully"));
  } catch (error) {
    throw new ApiError(500, "Error importing tasks");
  } finally {
    deleteFile(filePath);
  }
});

const exportRecipes = asyncHandler(async (req, res) => {
  const tasks = await recipeModel.find({}).populate("createdBy");

  const csvData = [];
  tasks.forEach((task) => {
    const cleanTask = {
      title: task.title,
      ingredients: task.ingredients,
      type: task.type,
      createdBy: task.createdBy.name,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
    csvData.push(cleanTask);
  });

  fastCsv
    .writeToStream(res, csvData, { headers: true })
    .on("finish", () => res.end())
    .on("error", (err) => console.error(err));
});

const getAllRecipes = asyncHandler(async (req, res) => {
  const recipes = await recipeModel.find().populate("createdBy", "name");
  return res.json(
    new ApiResponse(200, recipes, "All recipes retrieved successfully")
  );
});

const getUserRecipes = asyncHandler(async (req, res) => {
  const user = req.user;
  let recipes;

  if (user.role === "admin") {
    recipes = await recipeModel.find().populate("createdBy", "name");
  } else {
    recipes = await recipeModel
      .find({ createdBy: user._id })
      .populate("createdBy", "name");
  }

  return res.json(
    new ApiResponse(200, recipes, "User recipes retrieved successfully")
  );
});

export {
  addRecipe,
  deleteRecipe,
  updateRecipe,
  getRecipes,
  importRecipes,
  exportRecipes,
  getAllRecipes,
  getUserRecipes,
};