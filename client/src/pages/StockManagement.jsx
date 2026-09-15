import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../api/axiosInstance";
import "./StockManagement.css";

function StockManagement() {
  const [showStockIn, setShowStockIn] = useState(false);
  const [showStockOut, setShowStockOut] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);

  const [stockInData, setStockInData] = useState({
    productId: "",
    quantity: "",
    reason: "",
  });

  const [stockOutData, setStockOutData] = useState({
    productId: "",
    quantity: "",
    reason: "",
  });

  const [adjustmentData, setAdjustmentData] = useState({
    productId: "",
    newStock: "",
    reason: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/products", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();

    const fetchMovements = async () => {
      try {
        const response = await axiosInstance.get("/stock/movements");

        console.log("Movements:", response.data);

        setMovements(response.data.movements || []);
      } catch (error) {
        console.error(
          "Fetch Movements Error:",
          error.response?.data || error.message
        );
      }
    };

    fetchMovements();
  }, []);

  // =========================
  // STOCK IN
  // =========================

  const handleStockInChange = (event) => {
    const { name, value } = event.target;

    setStockInData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleStockInSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axiosInstance.post("/stock/in", {
        productId: stockInData.productId,
        quantity: Number(stockInData.quantity),
        reason: stockInData.reason,
      });

      console.log("Stock In Success:", response.data);

      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product._id === response.data.product._id
            ? response.data.product
            : product
        )
      );

      alert("Stock In berhasil!");

      closeStockInModal();
    } catch (error) {
      console.error(
        "Stock In Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Stock In gagal. Silakan cek console."
      );
    }
  };

  const closeStockInModal = () => {
    setShowStockIn(false);

    setStockInData({
      productId: "",
      quantity: "",
      reason: "",
    });
  };

  // =========================
  // STOCK OUT
  // =========================

  const handleStockOutChange = (event) => {
    const { name, value } = event.target;

    setStockOutData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleStockOutSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axiosInstance.post("/stock/out", {
        productId: stockOutData.productId,
        quantity: Number(stockOutData.quantity),
        reason: stockOutData.reason,
      });

      console.log("Stock Out Success:", response.data);

      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product._id === response.data.product._id
            ? response.data.product
            : product
        )
      );

      alert("Stock Out berhasil!");

      closeStockOutModal();
    } catch (error) {
      console.error(
        "Stock Out Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Stock Out gagal. Silakan cek console."
      );
    }
  };

  const closeStockOutModal = () => {
    setShowStockOut(false);

    setStockOutData({
      productId: "",
      quantity: "",
      reason: "",
    });
  };

  // =========================
  // ADJUSTMENT
  // =========================

  const handleAdjustmentChange = (event) => {
    const { name, value } = event.target;

    setAdjustmentData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAdjustmentSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axiosInstance.post("/stock/adjustment", {
        productId: adjustmentData.productId,
        newStock: Number(adjustmentData.newStock),
        reason: adjustmentData.reason,
      });

      console.log("Adjustment Success:", response.data);

      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product._id === response.data.product._id
            ? response.data.product
            : product
        )
      );

      alert("Adjustment berhasil!");

      closeAdjustmentModal();
    } catch (error) {
      console.error(
        "Adjustment Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Adjustment gagal. Silakan cek console."
      );
    }
  };

  const closeAdjustmentModal = () => {
    setShowAdjustment(false);

    setAdjustmentData({
      productId: "",
      newStock: "",
      reason: "",
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="stock-page">
        <div className="stock-header">
          <div>
            <h1>Stock Management</h1>
            <p>Manage stock movements and inventory adjustments.</p>
          </div>
        </div>

        <div className="stock-actions">
          <button
            className="stock-action-button"
            onClick={() => setShowStockIn(true)}
          >
            Stock In
          </button>

          <button
            className="stock-action-button"
            onClick={() => setShowStockOut(true)}
          >
            Stock Out
          </button>

          <button
            className="stock-action-button"
            onClick={() => setShowAdjustment(true)}
          >
            Adjustment
          </button>
        </div>

        <div className="stock-history-card">
          <div className="stock-history-header">
            <div>
              <h2>Stock Movement History</h2>
              <p>Recent changes to your inventory.</p>
            </div>
          </div>

        {movements.length === 0 ? (
          <div className="stock-empty-state">
            <p>No stock movements to display.</p>
          </div>
        ) : (
          <div className="stock-table-container">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Previous Stock</th>
                  <th>New Stock</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr key={movement._id}>
                    <td>{movement.product?.name || "-"}</td>
                    <td>{movement.product?.sku || "-"}</td>
                    <td>
                      <span className={`stock-movement-type ${movement.type.toLowerCase()}`}>
                        {movement.type}
                      </span>
                    </td>
                    <td>{movement.quantity}</td>
                    <td>{movement.previousStock}</td>
                    <td>{movement.newStock}</td>
                    <td>{movement.reason || "-"}</td>
                    <td>
                      {new Date(movement.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>

      {/* =========================
          STOCK IN MODAL
      ========================= */}

      {showStockIn && (
        <div className="stock-modal-overlay">
          <div className="stock-modal">
            <div className="stock-modal-header">
              <div>
                <h2>Stock In</h2>
                <p>Add stock to your inventory.</p>
              </div>

              <button
                type="button"
                className="stock-close-button"
                onClick={closeStockInModal}
              >
                ×
              </button>
            </div>

            <form
              className="stock-form"
              onSubmit={handleStockInSubmit}
            >
              <div className="stock-form-group">
                <label htmlFor="stockInProductId">Product</label>

                <select
                  id="stockInProductId"
                  name="productId"
                  value={stockInData.productId}
                  onChange={handleStockInChange}
                  required
                >
                  <option value="">Select product</option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                    >
                      {product.name} — Stock: {product.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="stock-form-group">
                <label htmlFor="stockInQuantity">Quantity</label>

                <input
                  id="stockInQuantity"
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={stockInData.quantity}
                  onChange={handleStockInChange}
                  required
                />
              </div>

              <div className="stock-form-group">
                <label htmlFor="stockInReason">Reason</label>

                <input
                  id="stockInReason"
                  name="reason"
                  type="text"
                  placeholder="e.g. Restock from supplier"
                  value={stockInData.reason}
                  onChange={handleStockInChange}
                />
              </div>

              <div className="stock-form-actions">
                <button
                  type="button"
                  className="stock-cancel-button"
                  onClick={closeStockInModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="stock-save-button"
                >
                  Save Stock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          STOCK OUT MODAL
      ========================= */}

      {showStockOut && (
        <div className="stock-modal-overlay">
          <div className="stock-modal">
            <div className="stock-modal-header">
              <div>
                <h2>Stock Out</h2>
                <p>Remove stock from your inventory.</p>
              </div>

              <button
                type="button"
                className="stock-close-button"
                onClick={closeStockOutModal}
              >
                ×
              </button>
            </div>

            <form
              className="stock-form"
              onSubmit={handleStockOutSubmit}
            >
              <div className="stock-form-group">
                <label htmlFor="stockOutProductId">Product</label>

                <select
                  id="stockOutProductId"
                  name="productId"
                  value={stockOutData.productId}
                  onChange={handleStockOutChange}
                  required
                >
                  <option value="">Select product</option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                    >
                      {product.name} — Stock: {product.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="stock-form-group">
                <label htmlFor="stockOutQuantity">Quantity</label>

                <input
                  id="stockOutQuantity"
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={stockOutData.quantity}
                  onChange={handleStockOutChange}
                  required
                />
              </div>

              <div className="stock-form-group">
                <label htmlFor="stockOutReason">Reason</label>

                <input
                  id="stockOutReason"
                  name="reason"
                  type="text"
                  placeholder="e.g. Damaged item"
                  value={stockOutData.reason}
                  onChange={handleStockOutChange}
                />
              </div>

              <div className="stock-form-actions">
                <button
                  type="button"
                  className="stock-cancel-button"
                  onClick={closeStockOutModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="stock-save-button"
                >
                  Save Stock Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          ADJUSTMENT MODAL
      ========================= */}
      {showAdjustment && (
        <div className="stock-modal-overlay">
          <div className="stock-modal">
            <div className="stock-modal-header">
              <h2>Stock Adjustment</h2>

              <button
                className="stock-modal-close"
                onClick={closeAdjustmentModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit}>
              <div className="stock-form-group">
                <label>Product</label>

                <select
                  name="productId"
                  value={adjustmentData.productId}
                  onChange={handleAdjustmentChange}
                  required
                >
                  <option value="">Select product</option>

                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} — Current Stock: {product.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="stock-form-group">
                <label>New Stock</label>

                <input
                  type="number"
                  name="newStock"
                  value={adjustmentData.newStock}
                  onChange={handleAdjustmentChange}
                  min="0"
                  placeholder="Enter actual stock"
                  required
                />
              </div>

              <div className="stock-form-group">
                <label>Reason</label>

                <input
                  type="text"
                  name="reason"
                  value={adjustmentData.reason}
                  onChange={handleAdjustmentChange}
                  placeholder="e.g. Stock opname"
                />
              </div>

              <div className="stock-modal-actions">
                <button
                  type="button"
                  className="stock-cancel-button"
                  onClick={closeAdjustmentModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="stock-submit-button"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockManagement;