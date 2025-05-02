const express = require("express");
const studentController = require("../controllers/student.controller");

const router = express.Router();

// Define routes
router.post("/", studentController.createStudentAPI);
router.get("/", studentController.getStudentAPI);
router.get("/:id", studentController.getStudentById);
router.put('/:id', studentController.updateStudentWithMarksAPI)
router.delete('/:id', studentController.deleteStudentAPI)




module.exports = router
