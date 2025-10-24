// ===================================
// services/menu-service/src/validators/recipeValidator.js
// ===================================
const Joi = require('joi');

// Schema cho từng món (recipe)
const recipeSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Tên món là bắt buộc',
    'string.max': 'Tên món tối đa 255 ký tự',
  }),

  ingredients: Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .required()
    .messages({
      'array.min': 'Ingredients phải có ít nhất 1 phần tử',
      'any.required': 'Ingredients là bắt buộc',
    }),

  instructions: Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .required()
    .messages({
      'array.min': 'Instructions phải có ít nhất 1 bước hướng dẫn',
      'any.required': 'Instructions là bắt buộc',
    }),

  prepTimeMinutes: Joi.number().integer().min(0).required().messages({
    'number.base': 'prepTimeMinutes phải là số nguyên',
    'number.min': 'prepTimeMinutes phải ≥ 0',
  }),

  cookTimeMinutes: Joi.number().integer().min(0).required(),

  servings: Joi.number().integer().min(1).required().messages({
    'number.min': 'servings phải ≥ 1',
  }),

  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required().messages({
    'any.only': 'difficulty phải là Easy, Medium hoặc Hard',
  }),

  cuisine: Joi.string().allow('', null).max(100),

  caloriesPerServing: Joi.number().integer().min(0).required().messages({
    'number.min': 'caloriesPerServing phải ≥ 0',
  }),

  tags: Joi.array().items(Joi.string()).optional(),

  userId: Joi.number().integer().min(1).required(),

  image: Joi.string().uri().optional().messages({
    'string.uri': 'image phải là URL hợp lệ',
  }),

  rating: Joi.number().min(0).max(5).optional(),

  reviewCount: Joi.number().integer().min(0).optional(),

  mealType: Joi.array().items(Joi.string()).optional(),

  price: Joi.number().integer().min(0).required().messages({
    'number.min': 'price phải ≥ 0',
  }),
});

// Schema cho update (cho phép partial update)
const updateRecipeSchema = recipeSchema.fork(
  Object.keys(recipeSchema.describe().keys),
  (field) => field.optional()
);

// Hàm validate
function validateRecipe(data) {
  return recipeSchema.validate(data, { abortEarly: false });
}

function validateUpdateRecipe(data) {
  return updateRecipeSchema.validate(data, { abortEarly: false });
}

module.exports = {
  validateRecipe,
  validateUpdateRecipe,
};

// {
//   "name": "Phở bò đặc biệt",
//   "ingredients": ["bánh phở", "thịt bò", "hành lá", "nước dùng"],
//   "instructions": ["Đun sôi nước dùng", "Chần bánh phở", "Thêm thịt bò"],
//   "prepTimeMinutes": 10,
//   "cookTimeMinutes": 30,
//   "servings": 2,
//   "difficulty": "Medium",
//   "cuisine": "Vietnamese",
//   "caloriesPerServing": 450,
//   "tags": ["noodle", "soup"],
//   "userId": 1,
//   "image": "https://thanhphuoc.com/pho.jpg",
//   "rating": 4.8,
//   "reviewCount": 230,
//   "mealType": ["Lunch"],
//   "price": 60000
// }