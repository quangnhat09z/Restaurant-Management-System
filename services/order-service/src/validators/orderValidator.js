// ===================================
// services/order-service/src/validators/orderValidator.js
// ===================================
const Joi = require('joi');

const orderItemSchema = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().min(1).max(100).required(),
  Quantity: Joi.number().integer().min(1).max(100).required(),
  price: Joi.number().positive().required()
});

const orderSchema = Joi.object({
  CustomerID: Joi.number()
    .integer()
    .min(1) 
    .required()
    .messages({
      'number.min': 'CustomerID must be at least 1',
      'any.required': 'CustomerID is required'
    }),
  ContactNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Contact number must be 10-15 digits',
      'any.required': 'Contact number is required'
    }),
  TableNumber: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required()
    .messages({
      'number.min': 'Table number must be at least 1',
      'number.max': 'Table number cannot exceed 100',
      'any.required': 'Table number is required'
    }),
  CustomerName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Customer name must be at least 2 characters',
      'string.max': 'Customer name cannot exceed 100 characters',
      'any.required': 'Customer name is required'
    }),
  Cart: Joi.array()
    .items(orderItemSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'Cart must contain at least one item',
      'any.required': 'Cart is required'
    })
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'preparing', 'ready', 'delivered', 'cancelled')
    .required()
});

function validateOrder(data) {
  return orderSchema.validate(data, { abortEarly: false });
}

function validateUpdateStatus(data) {
  return updateStatusSchema.validate(data);
}

module.exports = {
  validateOrder,
  validateUpdateStatus
};