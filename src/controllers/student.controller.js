const { Op } = require("sequelize");
const { DB } = require("../configs/dbConfig");
const fs = require("fs");
const path = require("path");
const studentValidation = require("../validations/studentValidation");
const paginationWithTypeValidation = require("../validations/paginationValidation");
const { ApiSuccess, ApiError } = require("../utils/apiResponse");
const idValidation = require("../validations/idValidation");

// Create Student
const createStudentAPI = async (req, res) => {
  const t = await DB.sequelize.transaction();

  try {
    // Validate request body
    const { error: bodyError, value: bodyValue } = studentValidation.studentSchema.validate(req.body);
    if (bodyError) {
      return ApiError(res, 400, bodyError.details[0].message);
    }

    // Create student
    const enterStudentData = await DB.studentModel.create(bodyValue, { transaction: t });
    if (!enterStudentData) {
      await t.rollback();
      return ApiError(res, 400, "Failed to create student");
    }

    // If marks are provided, insert them
    if (Array.isArray(req.body.marks) && req.body.marks.length > 0) {
      const marksData = req.body.marks.map((mark) => ({
        ...mark,
        student_id: enterStudentData.id,
      }));

      const enterMarksData = await DB.marksModel.bulkCreate(marksData, { transaction: t });
      if (!enterMarksData) {
        await t.rollback();
        return ApiError(res, 400, "Failed to create marks");
      }
    }

    // Commit transaction if everything went fine
    await t.commit();

    return ApiSuccess(res, 200, true, "Student and (if provided) marks created successfully", enterStudentData);

  } catch (error) {
    await t.rollback();
    console.error("Error in Student creation:", error);
    return ApiError(res, 400, error?.message || "Something went wrong");
  }
};

// get Student List
const getStudentAPI = async (req, res) => {
  try {
    // Check Validation
    const { error, value } = paginationWithTypeValidation.validate(req.query);
    if (error) {
      return ApiError(res, 400, error.details[0].message);
    }
    const { page = 1, limit = 10, name = "", email = "" } = value;
    const offset = (page - 1) * limit;

    const whereClause = {};
  
    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
        whereClause.email = { [Op.like]: `%${email}%` };
      }
    // Get all student data
    const { count: total, rows: allUsers } =
      await DB.studentModel.findAndCountAll({
        where: whereClause,
        limit: limit,
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

    const data = {
      currentPage: page,
      totalPage: Math.ceil(total / limit),
      totalCount: total,
      studentData: allUsers,
    };

    return ApiSuccess(res, 200, true, "Get All student Data", data);
  } catch (error) {
    return ApiError(res, 500, error?.message);
  }
};

// update Student
const updateStudentWithMarksAPI = async (req, res) => {
  const t = await DB.sequelize.transaction(); // Start transaction

  try {
    // Validate ID
    const { error: idError, value: idValue } = idValidation.idSchema.validate(req.params);
    if (idError) {
      return ApiError(res, 400, idError.details[0].message);
    }

    // Validate Body
    const { error: bodyError, value: bodyValue } = studentValidation.updateStudentSchema.validate(req.body);
    if (bodyError) {
      return ApiError(res, 400, bodyError.details[0].message);
    }

    // Find existing student
    const existingStudent = await DB.studentModel.findByPk(idValue.id);
    if (!existingStudent) {
      return ApiError(res, 404, "Student not found");
    }

    // Update student
    await DB.studentModel.update(bodyValue, {
      where: { id: idValue.id },
      transaction: t,
    });

    // Update marks if provided
    if (req.body.marks && Array.isArray(req.body.marks)) {
      // Delete old marks
      await DB.marksModel.destroy({
        where: { student_id: idValue.id },
        transaction: t,
      });

      // Add new marks
      const newMarks = req.body.marks.map((mark) => ({
        ...mark,
        student_id: idValue.id,
      }));

      await DB.marksModel.bulkCreate(newMarks, { transaction: t });
    }

    await t.commit();
    return ApiSuccess(res, 200, true, "Student and marks updated successfully");
  } catch (error) {
    await t.rollback();
    return ApiError(res, 500, error?.message);
  }
};

// Delete student
const deleteStudentAPI = async (req, res) => {
  try {
    const { error: idError, value: idValue } = idValidation.idSchema.validate(
      req.params
    );
    if (idError) {
      return ApiError(res, 400, idError.details[0].message);
    }

    // Check if student exists
    const existingStudent = await DB.studentModel.findByPk(idValue.id);
    if (!existingStudent) {
      return ApiError(res, 404, "Data not found");
    }
    await existingStudent.destroy();
    return ApiSuccess(res, 200, true, "Student deleted successfully");
  } catch (error) {
    return ApiError(res, 500, error?.message);
  }
};

// Get Student by Id
const getStudentById = async (req, res) => {
  try {
    // Check Validation
    const { error, value } = idValidation.idSchema.validate(req.params);
    if (error) return ApiError(res, 400, error.details[0].message);

    // Get student by id
    const studentData = await DB.studentModel.findByPk(value?.id,
      {
        attributes: ["id", "name", "email", "phone_number", "age"],
        // Include marks data
      include: [
        {
          model: DB.marksModel,
          as: "marks",
          attributes: ["id", "subject", "score"],
        },
      ],
    });

    if (studentData) {
      return ApiSuccess(res, 200, true, "Get student detail", studentData);
    } else {
      return ApiError(res, 400, "student not found");
    }
  } catch (error) {
    return ApiError(res, 500, error?.message);
  }
};

module.exports = {
  createStudentAPI,
  getStudentAPI,
  getStudentById,
  updateStudentWithMarksAPI,
  deleteStudentAPI,
};
