const menuService = require('../services/menuService');
const {
  validateUpdateRecipe,
  validateRecipe,
} = require('../validators/menuValidator');
const { clearMenuCache, clearCache } = require('../middleware/cacheMiddleware');

exports.getAllMenu = async (req, res) => {
  try {
    // Hiện 12 món
    const { page = 1, limit = 12 } = req.query; 
    const menus = await menuService.getAllMenus(page, limit);
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    console.log(req.params);
    const menu = await menuService.getMenuById(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const { error } = validateRecipe(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }
    const id = await menuService.createMenu(req.body);

    // Clear cache sau khi tạo mới
    await clearCache('menu:/*');

    res.status(201).json({ message: 'Menu created', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { error } = validateUpdateRecipe(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    const updated = await menuService.updateMenu(req.params.id, req.body);

    // Clear cache cho menu cụ thể và danh sách
    await clearMenuCache(req.params.id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    await menuService.deleteMenu(req.params.id);

    // Clear cache sau khi xóa
    await clearMenuCache(req.params.id);

    res.json({ message: 'Menu deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.filterMenus = async (req, res) => {
  try {
    const filters = req.query;
    const results = await menuService.filterMenus(filters);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No matching menus found' });
    }

    res.json(results);
  } catch (error) {
    console.error('Error filtering menus:', error);
    res.status(500).json({ error: 'Failed to filter menus' });
  }
};
