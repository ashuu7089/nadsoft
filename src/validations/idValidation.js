
const Joi = require("joi");

const idSchema = Joi.object({
    id: Joi.number().integer().required(),
});


module.exports = {idSchema};
