const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  exportToCSV();
}).catch(err => {
  console.error('DB connection error:', err.message);
});

// Define Product model (reuse schema if not imported)
const Product = require('../models/productModel');

// Export function
const exportToCSV = async () => {
  try {
    const products = await Product.find().select('name category price available');
    if (!products.length) {
      console.log('No products found to export.');
      process.exit(0);
    }

    const fields = ['name', 'category', 'price', 'available'];
    const parser = new Parser({ fields });
    const csv = parser.parse(products);

    const outputPath = path.join(__dirname, '../exports/products_export.csv');
    fs.writeFileSync(outputPath, csv);

    console.log(`CSV export complete → ${outputPath}`);
    process.exit(0);
  } catch (err) {
    console.error(' Failed to export CSV:', err.message);
    process.exit(1);
  }
};
