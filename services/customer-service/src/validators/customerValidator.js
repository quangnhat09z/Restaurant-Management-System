// services/customer-service/src/validators/customerValidator.js
const Joi = require('joi');

const registerSchema = Joi.object({
  customerName: Joi.string().min(1).max(100).required(),
  Email: Joi.string().email().required(),
  ContactNumber: Joi.string().min(7).max(20).required(),
  Password: Joi.string().min(6).required(),
  Address: Joi.string().allow('', null).max(255),
});

const updateSchema = Joi.object({
  customerName: Joi.string().min(1).max(100).optional(),
  Email: Joi.string().email().optional(),
  ContactNumber: Joi.string().min(7).max(20).optional(),
  Address: Joi.string().allow('', null).max(255).optional(),
});

function validateRegister(data) {
  return registerSchema.validate(data, { abortEarly: false });
}

function validateUpdate(data) {
  return updateSchema.validate(data, { abortEarly: false });
}

module.exports = { validateRegister, validateUpdate };
