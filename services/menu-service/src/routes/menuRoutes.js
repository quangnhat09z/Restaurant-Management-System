const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menuController');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Cache thời gian (giây)
const CACHE_DURATION = {
  LIST: 7200, 
  DETAIL: 7200, // 3600/60=60p
  FILTER: 7200, 
};

// GET routes với cache
router.get(
  '/filter',
  cacheMiddleware(CACHE_DURATION.FILTER),
  MenuController.filterMenus
);
router.get(
  '/',
  cacheMiddleware(CACHE_DURATION.LIST),
  MenuController.getAllMenu
);
router.get(
  '/:id',
  cacheMiddleware(CACHE_DURATION.DETAIL),
  MenuController.getMenuById
);

// POST, PUT, DELETE routes không cache
router.post('/', MenuController.createMenu);
router.put('/:id', MenuController.updateMenu);
router.delete('/:id', MenuController.deleteMenu);

module.exports = router;
