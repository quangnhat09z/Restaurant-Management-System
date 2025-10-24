const express = require('express')
const router= express.Router();
const MenuController= require('../controllers/menuController');


// http://localhost:3002/api/menu/
router.get('/', MenuController.getAllMenu);


//Admin sau se lam xac thuc o day

// http://localhost:3002/api/menu/1
router.get('/:id',MenuController.getMenuById);

//http://localhost:3002/api/menu/1
// {
//     "price": "70"
// }
router.put('/:id', MenuController.updateMenu);

// http://localhost:3002/api/menu/51
router.delete('/:id',MenuController.deleteMenu);

// http://localhost:3002/api/menu/
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
router.post('/',MenuController.createMenu)





module.exports= router;