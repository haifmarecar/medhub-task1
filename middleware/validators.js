const { body } = require('express-validator');

exports.validateProduct = [
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('available').isBoolean().withMessage('Availability must be true or false')
];

exports.validateUser = [
  body('fullName').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];
