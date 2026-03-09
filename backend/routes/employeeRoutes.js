const express = require("express");
const Employee = require("../models/Employee");
const authMiddleware = require("../middleware/authMiddleware");

console.log("Employee typeof:", typeof Employee);
console.log("Employee keys:", Employee && Object.keys(Employee));

const router = express.Router();

/**
 * GET /api/employees
 * Protected
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.status(200).json(employees);
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/employees
 * Body: { firstName, lastName, email?, position?, department? }
 * Protected
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, email, position, department } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: "First name and last name are required." });
    }

    const newEmployee = await Employee.create({
      firstName,
      lastName,
      email,
      position,
      department,
      createdBy: req.user.id, // from middleware decoded token
    });

    return res.status(201).json(newEmployee);
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * PUT /api/employees/:id
 * Protected
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Employee not found." });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * DELETE /api/employees/:id
 * Protected
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Employee not found." });
    }

    return res.status(200).json({ message: "Employee deleted successfully." });
  } catch (error) {
    console.error("DELETE EMPLOYEE ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;