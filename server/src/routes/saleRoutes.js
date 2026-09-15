const express = require("express");

const {
  createSale,
  getSales,
  getSaleById,
} = require("../controllers/saleController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createSale);
router.get("/", protect, getSales);
router.get("/:id", protect, getSaleById);

module.exports = router;