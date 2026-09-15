import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import "./Products.css";

function Products() {
const [products, setProducts] = useState([]);
const [pagination, setPagination] = useState(null);
const [page, setPage] = useState(1);
const limit = 10;

const [search, setSearch] = useState("");
const [category, setCategory] = useState("");
const [lowStock, setLowStock] = useState(false);
const [categories, setCategories] = useState([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [showForm, setShowForm] = useState(false);
const [editingProductId, setEditingProductId] = useState(null);

const [formData, setFormData] = useState({
  name: "",
  sku: "",
  category: "",
  purchasePrice: "",
  sellingPrice: "",
  stock: "",
  minimumStock: "",
  unit: "pcs",
});

const fetchProducts = async () => {
  try {
    setError("");

  const params = {
    search,
    category,
    lowStock: lowStock ? "true" : undefined,
    page,
    limit,
  };

  const response = await axiosInstance.get("/products", {
    params,
  });

  setProducts(response.data.products);
  setPagination(response.data.pagination);
} catch (error) {
  setError(
    error.response?.data?.message ||
      "Failed to load products."
  );
} finally {
  setLoading(false);
}

};

const fetchCategories = async () => {
try {
const response = await axiosInstance.get(
"/products/categories"
);

  setCategories(response.data.categories);
} catch (error) {
  console.error("Failed to load categories:", error);
}

};

useEffect(() => {
  fetchCategories();
}, []);

const handleSubmit = async (event) => {
  event.preventDefault(); 
  
  try { 
    setError(""); 
    
    const payload = { 
      name: formData.name, 
      sku: formData.sku, 
      category: formData.category, 
      purchasePrice: Number(formData.purchasePrice), 
      sellingPrice: Number(formData.sellingPrice), 
      minimumStock: Number(formData.minimumStock), 
      unit: formData.unit, 
    }; 
    
    if (editingProductId) { 
      await axiosInstance.put( 
        `/products/${editingProductId}`, 
        payload 
      ); 
    } else { 
      await axiosInstance.post("/products", { 
        ...payload, 
        stock: Number(formData.stock), 
      }); 
    } 
    
    setShowForm(false); 
    setEditingProductId(null); 
    
    setFormData({ 
      name: "", 
      sku: "", 
      category: "", 
      purchasePrice: "", 
      sellingPrice: "", 
      stock: "", 
      minimumStock: "", 
      unit: "pcs", 
    }); 
    
    setPage(1); 
    fetchProducts(); 
  } catch (error) { 
    setError( 
      error.response?.data?.message || 
        "Failed to save product." 
      ); 
    } 
  };

useEffect(() => {
  const timer = setTimeout(() => {
    fetchProducts();
  }, 500);

  return () => {
    clearTimeout(timer);
  };
}, [search, category, lowStock, page]);

const handleEdit = (product) => {
  setEditingProductId(product._id);
  
  setFormData({
    name: product.name,
    sku: product.sku,
    category: product.category,
    purchasePrice: product.purchasePrice,
    sellingPrice: product.sellingPrice,
    stock: product.stock,
    minimumStock: product.minimumStock,
    unit: product.unit,
  });

  setShowForm(true);
};

const handleDelete = async (product) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${product.name}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setError("");

    await axiosInstance.delete(`/products/${product._id}`);

    fetchProducts();
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to delete product."
    );
  }
};

useEffect(() => {
  setPage(1);
}, [search, category, lowStock]);

if (loading) {
return <p>Loading products...</p>;
}

if (error) {
return <p>{error}</p>;
}

return (
  <div className="dashboard-layout">
    <Sidebar />
  <div className="products-page">

  {showForm && (
    <div className="product-modal-overlay">
      <div className="product-modal">
        <div className="product-modal-header">
          <div>
            <h2>{editingProductId ? "Edit Product" : "Add Product"}</h2>
            <p>
              {editingProductId
              ? "Update product information."
              : "Add a new product to your inventory."}
            </p>
          </div>

          <button
            type="button"
            className="close-modal-button"
            onClick={() => setShowForm(false)}
          >
            ×
          </button>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="e.g. Mechanical Keyboard"
              value={formData.name}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  name: event.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>SKU</label>
            <input
              type="text"
              placeholder="e.g. KB-MECH-001"
              value={formData.sku}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  sku: event.target.value,
                })
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                placeholder="e.g. Accessories"
                value={formData.category}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    category: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                placeholder="pcs"
                value={formData.unit}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    unit: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Purchase Price</label>
              <input
                type="number"
                placeholder="650000"
                value={formData.purchasePrice}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    purchasePrice: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Selling Price</label>
              <input
                type="number"
                placeholder="950000"
                value={formData.sellingPrice}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    sellingPrice: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Initial Stock</label>
              <input
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    stock: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Minimum Stock</label>
              <input
                type="number"
                placeholder="10"
                value={formData.minimumStock}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    minimumStock: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="product-form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button type="submit" className="save-product-button">
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  <div className="products-header">
    <div>
      <h1>Products</h1>
      <p>Manage your inventory products.</p> 
    </div>
    
    <button
      type="button"
      className="add-product-button"
      onClick={() => setShowForm(true)}
    >
      + Add Product
    </button> 
  </div>

  <div className="products-filters">

    <input
      type="text"
      placeholder="Search product or SKU..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
    />

    <select
      value={category}
      onChange={(event) => setCategory(event.target.value)}
    >
      <option value="">All Categories</option>

      {categories.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>

    <label className="low-stock-filter">
      <input
        type="checkbox"
        checked={lowStock}
        onChange={(event) => setLowStock(event.target.checked)}
      />

      Low Stock Only
    </label>

  </div>

  <div className="products-table-wrapper">

    <table className="products-table">

      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Category</th>
          <th>Purchase Price</th>
          <th>Selling Price</th>
          <th>Stock</th>
          <th>Min. Stock</th>
          <th>Unit</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        {products.length > 0 ? (
          products.map((product) => (
            <tr key={product._id}>

              <td>
                <strong>{product.name}</strong>
              </td>

              <td>
                {product.sku}
              </td>

              <td>
                {product.category}
              </td>

              <td>
                Rp{" "}
                {product.purchasePrice?.toLocaleString(
                  "id-ID"
                )}
              </td>

              <td>
                Rp{" "}
                {product.sellingPrice?.toLocaleString(
                  "id-ID"
                )}
              </td>

              <td>
                {product.stock}
              </td>

              <td>
                {product.minimumStock}
              </td>

              <td>{product.unit}</td>
              <td>
                <button
                  type="button"
                  className="edit-product-button"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-product-button"
                  onClick={() => handleDelete(product)}
                >
                  Delete
                </button>
              </td>

            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8" className="empty-state">
              No products found.
            </td>
          </tr>
        )}

      </tbody>

    </table>

  </div>

  {pagination && (
    <div className="products-pagination">
      <span>
        Showing {products.length} of {pagination.totalProducts} products
      </span>

      <div>
        <button
          type="button"
          onClick={() => setPage((currentPage) => currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
        >
          Previous
        </button>

        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>

        <button
          type="button"
          onClick={() => setPage((currentPage) => currentPage + 1)}
          disabled={!pagination.hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  )}

</div>
</div>
);
}

export default Products;