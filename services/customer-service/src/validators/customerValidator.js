// services/user-service/src/validators/userValidator.js
const Joi = require('joi');

const registerSchema = Joi.object({
  userName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  contactNumber: Joi.string().min(7).max(20).required(),
  password: Joi.string().min(6).required(),
  address: Joi.string().allow('', null).max(255),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

const updateSchema = Joi.object({
  userName: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
  contactNumber: Joi.string().min(7).max(20).optional(),
  address: Joi.string().allow('', null).max(255).optional(),
});

const updateStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});


function validateRegister(data) {
  return registerSchema.validate(data, { abortEarly: false });
}

function validateUpdate(data) {
  return updateSchema.validate(data, { abortEarly: false });
}

function validateLogin(data) {
  return loginSchema.validate(data, { abortEarly: false });
}

function validateUpdateStatus(data) {
  return updateStatusSchema.validate(data, { abortEarly: false });
}

module.exports = {
  validateRegister,
  validateUpdate,
  validateLogin,
  validateUpdateStatus,
};
