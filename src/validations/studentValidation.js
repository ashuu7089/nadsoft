const Joi = require('joi');

const studentSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.number().integer().required(),
  age: Joi.number().integer().min(1).max(120),
  marks: Joi.array().items(
    Joi.object({
      subject: Joi.string().required(),
      score: Joi.number().integer().min(0).max(100).required()
    })
  ).required()
  .messages({
    'array.base': 'Marks must be an array',
    'array.empty': 'Marks cannot be empty',
    'array.includesRequiredUnknowns': 'Each mark must have a subject and score'
  })
});

const updateStudentSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone_number: Joi.number(),
    age: Joi.number().integer().min(1).max(120),
    marks: Joi.array().items(
      Joi.object({
        subject: Joi.string().required(),
        score: Joi.number().integer().min(0).max(100).required()
      })
    )
    .messages({
      'array.base': 'Marks must be an array',
      'array.empty': 'Marks cannot be empty',
      'array.includesRequiredUnknowns': 'Each mark must have a subject and score'
    })
  });

module.exports = { studentSchema, updateStudentSchema };
