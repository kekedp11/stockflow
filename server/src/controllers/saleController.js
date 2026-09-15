const Sale = require("../models/Sale");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

// @desc    Create sale
// @route   POST /api/sales
const createSale = async (req, res) => {
  const session = await Sale.startSession();

  try {
    session.startTransaction();

    const { items, customerName } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Sale must contain at least one item",
      });
    }

    // Prevent duplicate products in the same sale
    const productIds = items.map((item) => item.productId);
    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "A product can only appear once in a sale",
      });
    }

    // Validate quantities
    for (const item of items) {
      const quantity = Number(item.quantity);

      if (!item.productId || !Number.isInteger(quantity) || quantity <= 0) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Each item must have a valid product ID and quantity",
        });
      }
    }

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).session(session);

    if (products.length !== productIds.length) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "One or more products were not found or are inactive",
      });
    }

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    const saleItems = [];
    const stockUpdates = [];
    let total = 0;

    // Check stock and calculate totals
    for (const item of items) {
      const product = productMap.get(item.productId.toString());
      const quantity = Number(item.quantity);

      if (product.stock < quantity) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const price = product.sellingPrice;
      const subtotal = price * quantity;

      total += subtotal;

      saleItems.push({
        product: product._id,
        quantity,
        price,
        subtotal,
      });

      stockUpdates.push({
        product,
        quantity,
      });
    }

    const invoiceNumber = `SF-${Date.now()}`;

    const movements = [];

    // Update stock and create movement history
    for (const item of stockUpdates) {
      const { product, quantity } = item;

      const previousStock = product.stock;
      const newStock = previousStock - quantity;

      product.stock = newStock;

      await product.save({ session });

      const [movement] = await StockMovement.create(
        [
          {
            product: product._id,
            type: "SALE",
            quantity,
            previousStock,
            newStock,
            reason: `Sale ${invoiceNumber}`,
            createdBy: req.user._id,
          },
        ],
        { session }
      );

      movements.push(movement);
    }

    // Create sale record
    const [sale] = await Sale.create(
      [
        {
          invoiceNumber,
          items: saleItems,
          total,
          customerName: customerName || "Walk-in Customer",
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      sale,
      movements,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Create sale error:", error);

    res.status(500).json({
      success: false,
      message: "Transaction failed",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// @desc    Get all sales
// @route   GET /api/sales
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("items.product", "name sku")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sales.length,
      sales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get sale by ID
// @route   GET /api/sales/:id
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("items.product", "name sku category")
      .populate("createdBy", "name email role");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.json({
      success: true,
      sale,
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
  createSale,
  getSales,
  getSaleById,
};