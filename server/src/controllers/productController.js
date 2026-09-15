const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      purchasePrice,
      sellingPrice,
      stock,
      minimumStock,
      unit,
    } = req.body;

    if (
      !name ||
      !sku ||
      !category ||
      purchasePrice === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, SKU, category, purchase price, and selling price are required",
      });
    }

    const existingProduct = await Product.findOne({
      sku: sku.toUpperCase(),
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
    }

    const product = await Product.create({
      name,
      sku,
      category,
      purchasePrice,
      sellingPrice,
      stock: stock ?? 0,
      minimumStock: minimumStock ?? 5,
      unit: unit || "pcs",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get products
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      lowStock,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {
      isActive: true,
    };

    // Search by product name or SKU
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter low stock
    if (lowStock === "true") {
      filter.$expr = {
        $lte: ["$stock", "$minimumStock"],
      };
    }

    // Pagination
    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * perPage;

    // Sorting
    const allowedSortFields = [
      "name",
      "sku",
      "category",
      "purchasePrice",
      "sellingPrice",
      "stock",
      "createdAt",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const safeOrder = order === "asc" ? 1 : -1;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("createdBy", "name email")
        .sort({ [safeSortBy]: safeOrder })
        .skip(skip)
        .limit(perPage),

      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / perPage);

    res.json({
      success: true,

      pagination: {
        currentPage,
        perPage,
        totalProducts,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },

      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", {
      isActive: true,
    });

    categories.sort((a, b) => a.localeCompare(b));

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      sku,
      category,
      purchasePrice,
      sellingPrice,
      minimumStock,
      unit,
      isActive,
    } = req.body;

    if (sku && sku.toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({
        sku: sku.toUpperCase(),
        _id: { $ne: product._id },
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
      }

      product.sku = sku.toUpperCase();
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (purchasePrice !== undefined) product.purchasePrice = purchasePrice;
    if (sellingPrice !== undefined) product.sellingPrice = sellingPrice;
    if (minimumStock !== undefined) product.minimumStock = minimumStock;
    if (unit !== undefined) product.unit = unit;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully",
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
  createProduct,
  getProducts,
  getCategories,
  getProductById,
  updateProduct,
  deleteProduct,
};