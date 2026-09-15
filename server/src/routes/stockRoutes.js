const express = require("express");

const {
  stockIn,
  stockOut,
  adjustStock,
  getStockMovements,
} = require("../controllers/stockController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/in", protect, stockIn);
router.post("/out", protect, stockOut);
router.post("/adjustment", protect, adjustStock);
router.get("/movements", protect, getStockMovements);

module.exports = router;