const Product = require('../models/productModel');
const User = require('../models/userModel');

// Create product with image upload
const addProduct = async (req, res) => {
  try {
    const { name, category, price, available, ownerId } = req.body;
    const image = req.file ? req.file.filename : null;

    const newProduct = await Product.create({
      name,
      category,
      price,
      available,
      image,
      ownerId
    });

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all products with pagination, search, and filtering
const fetchProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      search,
      minPrice,
      maxPrice,
      category,
      available
    } = req.query;

    const filter = {};

    // Search by name or category using regex
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtering
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single product by ID
const fetchProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product with optional new image
const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete product
const removeProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Aggregation: users and their products
const userProductList = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'ownerId',
          as: 'userProducts'
        }
      }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Aggregation: count products by category
const countProductsByCategory = async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 }
        }
      }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Export all functions
module.exports = {
  addProduct,
  fetchProducts,
  fetchProductById,
  updateProduct,
  removeProduct,
  userProductList,
  countProductsByCategory
};
