import { Router } from "express";
import {
  addRecipe,
  deleteRecipe,
  updateRecipe,
  getRecipes,
  importRecipes,
  exportRecipes,
} from "../controllers/recipe.controller.js";

import { isAuth } from "../middlewares/isAuth.middleware.js";
import upload from "../middlewares/multer.js";

const recipeRouter = Router();

// Define your routes here
recipeRouter.post("/register", isAuth, addRecipe);
recipeRouter.delete("/delete/:_id", isAuth, deleteRecipe);
recipeRouter.patch("/update/:_id", isAuth, updateRecipe);

recipeRouter.get("/getRecipes", getRecipes);
recipeRouter.post("/import", isAuth, upload.single("file"), importRecipes);
recipeRouter.get("/export", isAuth, exportRecipes);

export { recipeRouter };
