const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validateProduct } = require('../middleware/validators');
const handleValidationErrors = require('../middleware/errorhandler');

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

// Protected + Validated + File upload
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  validateProduct,
  handleValidationErrors,
  addProduct
);

router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  validateProduct,
  handleValidationErrors,
  updateProduct
);

router.delete('/:id', authMiddleware, removeProduct);

module.exports = router;
