import { Joi } from "celebrate";

export const createRecipeSchema = {
  body: {
    name: Joi.string().required(),
    description: Joi.string(),
    requiredTime: Joi.object().keys({
      prepTime: Joi.number(),
      cookTime: Joi.number()
    }),
    ingredients: Joi.array()
      .items(
        Joi.object().keys({
          amount: Joi.number(),
          measurement: Joi.string(),
          name: Joi.string()
        })
      )
      .required(),
    instructions: Joi.array()
      .items(Joi.string())
      .required(),
    displayImage: Joi.string()
  }
};
