import { Router } from "express";
import {
  addRecipe,
  deleteRecipe,
  updateRecipe,
  getAllRecipes,
  getUserRecipes,
  importRecipes,
  exportRecipes,
} from "../controllers/recipe.controller.js";

import { isAuth } from "../middlewares/isAuth.middleware.js";
import upload from "../middlewares/multer.js";

const recipeRouter = Router();

// Public route for home page
recipeRouter.get("/getAllRecipes", getAllRecipes);

// Protected routes
recipeRouter.use(isAuth);

recipeRouter.post("/register", addRecipe);
recipeRouter.delete("/delete/:_id", deleteRecipe);
recipeRouter.patch("/update/:_id", updateRecipe);

recipeRouter.get("/getUserRecipes", getUserRecipes);
recipeRouter.post("/import", upload.single("file"), importRecipes);
recipeRouter.get("/export", exportRecipes);

export { recipeRouter };
