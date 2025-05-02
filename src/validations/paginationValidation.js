const Joi = require("joi");

const paginationWithTypeValidation = Joi.object({
    page: Joi.number().integer(),
    limit: Joi.number().integer(),
    name: Joi.string().allow("", null),
    email: Joi.string().allow("", null),
});

module.exports = paginationWithTypeValidation;
