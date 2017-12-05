# Recipes App API

A rudamentary API for a recipe book app.

## Routes

### Authentication

---

`POST /register`

Registers a new user. Returns the user's token.

`POST /login`

Logs a user in. Return's the user's token.

### Recipes

---

`POST /recipes`

Creates a new recipe

`GET /recipes`

Gets all recipes. Can take a query string.

`GET /recipes/:recipeId`

Get a specific recipe.

`PUT /recipes/:recipeId`

Edits a specific recipe.

`PUT /recipes/:recipeId/like`

Allows a user to like a recipe.

`PUT /recipe/:recipeId/dislike`

Allows a user to remove their like on a recipe.

`DELETE /recipes/:recipeId/delete`

Allows a user to "delete" a recipe.

`PUT /recipes/:recipeId/undelete`

Allows a user to "undelete" a recipe.
