const menuService = require('../services/menuService');

exports.getAllMenu = async (req, res) => {
  try {
    const menus = await menuService.getAllMenus();
    console.log('Da chay dc den day')
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    console.log('Da chay den day');
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
    const id = await menuService.createMenu(req.body);
    res.status(201).json({ message: 'Menu created', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const updated = await menuService.updateMenu(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    await menuService.deleteMenu(req.params.id);
    res.json({ message: 'Menu deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
