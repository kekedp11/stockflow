const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

// @desc    Add stock
// @route   POST /api/stock/in
const stockIn = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    const amount = Number(quantity);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const previousStock = product.stock;
    const newStock = previousStock + amount;

    product.stock = newStock;
    await product.save();

    const movement = await StockMovement.create({
      product: product._id,
      type: "IN",
      quantity: amount,
      previousStock,
      newStock,
      reason: reason || "Stock added",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Stock added successfully",
      product,
      movement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Remove stock
// @route   POST /api/stock/out
const stockOut = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    const amount = Number(quantity);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const previousStock = product.stock;
    const newStock = previousStock - amount;

    product.stock = newStock;
    await product.save();

    const movement = await StockMovement.create({
      product: product._id,
      type: "OUT",
      quantity: amount,
      previousStock,
      newStock,
      reason: reason || "Stock removed",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Stock removed successfully",
      product,
      movement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Adjust stock
// @route   POST /api/stock/adjustment
const adjustStock = async (req, res) => {
  try {
    const { productId, newStock, reason } = req.body;

    if (!productId || newStock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and new stock are required",
      });
    }

    const updatedStock = Number(newStock);

    if (!Number.isFinite(updatedStock) || updatedStock < 0) {
      return res.status(400).json({
        success: false,
        message: "New stock must be 0 or greater",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const previousStock = product.stock;

    if (previousStock === updatedStock) {
      return res.status(400).json({
        success: false,
        message: "New stock is the same as current stock",
      });
    }

    const quantity = Math.abs(updatedStock - previousStock);

    product.stock = updatedStock;
    await product.save();

    const movement = await StockMovement.create({
      product: product._id,
      type: "ADJUSTMENT",
      quantity,
      previousStock,
      newStock: updatedStock,
      reason: reason || "Stock adjustment",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Stock adjusted successfully",
      product,
      movement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get stock movement history
// @route   GET /api/stock/movements
const getStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .populate("product", "name sku")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: movements.length,
      movements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  stockIn,
  stockOut,
  adjustStock,
  getStockMovements,
};