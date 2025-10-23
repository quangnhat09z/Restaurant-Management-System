const express = require('express')
const router= express.Router();
const MenuController= require('../controllers/menuController');



router.get('/', MenuController.getAllMenu);
router.get('/:id',MenuController.getMenuById);
router.put('/:id', MenuController.updateMenu);
router.delete('/:id',MenuController.deleteMenu);
router.post('/',MenuController.createMenu)



module.exports= router;