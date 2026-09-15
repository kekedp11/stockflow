const Product = require("../models/Product");
const Sale = require("../models/Sale");
const StockMovement = require("../models/StockMovement");

// @desc    Get dashboard summary
// @route   GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const [
      totalProducts,
      stockSummary,
      lowStockProducts,
      salesSummary,
      recentSales,
      recentMovements,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),

      Product.aggregate([
        {
          $match: {
            isActive: true,
          },
        },
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$stock" },
          },
        },
      ]),

      Product.find({
        isActive: true,
        $expr: {
          $lte: ["$stock", "$minimumStock"],
        },
      })
        .select("name sku stock minimumStock unit")
        .sort({ stock: 1 })
        .limit(5),

      Sale.aggregate([
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
          },
        },
      ]),

      Sale.find()
        .populate("items.product", "name sku")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .limit(5),

      StockMovement.find()
        .populate("product", "name sku")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,

      summary: {
        totalProducts,
        totalStock: stockSummary[0]?.totalStock || 0,
        lowStockCount: lowStockProducts.length,
        totalSales: salesSummary[0]?.totalSales || 0,
        totalRevenue: salesSummary[0]?.totalRevenue || 0,
      },

      lowStockProducts,
      recentSales,
      recentMovements,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};