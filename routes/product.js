const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/AuthMiddleware');

const {
  addProduct,
  fetchProducts,
  fetchProductById,
  updateProduct,
  removeProduct,
  userProductList,
  countProductsByCategory
} = require('../controllers/productController');

// Public
router.get('/', fetchProducts);
router.get('/:id', fetchProductById);
router.get('/agg/users-products', userProductList);
router.get('/agg/category-count', countProductsByCategory);

// Protected
router.post('/', authMiddleware, addProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, removeProduct);

module.exports = router;
