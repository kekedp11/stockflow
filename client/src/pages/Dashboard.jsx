import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

function Dashboard() {
const { user, logout } = useAuth();

const [dashboard, setDashboard] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const fetchDashboard = async () => {
try {
const response = await axiosInstance.get("/dashboard");
setDashboard(response.data);
} catch (error) {
setError(
error.response?.data?.message ||
"Failed to load dashboard data."
);
} finally {
setLoading(false);
}
};

fetchDashboard();

}, []);

if (loading) {
return <p>Loading dashboard...</p>;
}

if (error) {
return <p>{error}</p>;
}

return (
  <div className="dashboard-layout">
    <Sidebar />
  <div className="dashboard-page">

  {/* Header */}
  <header className="dashboard-header">
    <div>
      <h1>StockFlow</h1>
      <p>Inventory & Sales Management</p>
    </div>

    <div className="header-right">
      <span>{user?.name}</span>

      <button
        className="logout-button"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  </header>

  {/* Main Content */}
  <main className="dashboard-content">

    {/* Welcome */}
    <section className="welcome-section">
      <h2>Dashboard</h2>

      <p>
        Here's what's happening with your inventory today.
      </p>
    </section>

    {/* Summary Cards */}
    <section className="summary-grid">

      <div className="summary-card">
        <div className="card-label">
          Total Products
        </div>

        <div className="card-value">
          {dashboard?.summary?.totalProducts}
        </div>
      </div>

      <div className="summary-card">
        <div className="card-label">
          Total Stock
        </div>

        <div className="card-value">
          {dashboard?.summary?.totalStock}
        </div>
      </div>

      <div className="summary-card">
        <div className="card-label">
          Low Stock
        </div>

        <div className="card-value">
          {dashboard?.summary?.lowStockCount}
        </div>
      </div>

      <div className="summary-card">
        <div className="card-label">
          Total Sales
        </div>

        <div className="card-value">
          {dashboard?.summary?.totalSales}
        </div>
      </div>

      <div className="summary-card">
        <div className="card-label">
          Total Revenue
        </div>

        <div className="card-value revenue-value">
          Rp{" "}
          {dashboard?.summary?.totalRevenue?.toLocaleString(
            "id-ID"
          )}
        </div>
      </div>

    </section>

    {/* Recent Sales */}
    <section className="recent-section">

      <div className="section-header">
        <div>
          <h2>Recent Sales</h2>

          <p>
            Latest sales transactions
          </p>
        </div>
      </div>

      {dashboard?.recentSales?.length > 0 ? (
        <div className="sales-table-wrapper">

          <table className="sales-table">

            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {dashboard.recentSales.map((sale) => (
                <tr key={sale._id}>

                  <td className="invoice-number">
                    {sale.invoiceNumber}
                  </td>

                  <td>
                    {sale.customerName ||
                      "Walk-in Customer"}
                  </td>

                  <td>
                    {sale.items?.map((item) => (
                      <div
                        key={
                          item.product?._id ||
                          item.product
                        }
                      >
                        {item.product?.name ||
                          "Unknown Product"}{" "}
                        × {item.quantity}
                      </div>
                    ))}
                  </td>

                  <td className="sale-total">
                    Rp{" "}
                    {sale.total?.toLocaleString(
                      "id-ID"
                    )}
                  </td>

                  <td>
                    {new Date(
                      sale.createdAt
                    ).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      ) : (
        <div className="empty-state">
          No sales transactions yet.
        </div>
      )}

    </section>

    {/* Low Stock Products */}
    <section className="recent-section">
      <div className="section-header">
        <div>
          <h2>Low Stock Products</h2>
          <p>
            Products that need restocking
          </p>
        </div>
      </div>

      {dashboard?.lowStockProducts?.length > 0 ? (
        <div className="sales-table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Minimum Stock</th>
                <th>Unit</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.lowStockProducts.map((product) => (
                <tr key={product._id}>
                  <td className="invoice-number">
                    {product.name}
                  </td>

                  <td>
                    {product.sku}
                  </td>

                  <td className="sale-total">
                    {product.stock}
                  </td>

                  <td>
                    {product.minimumStock}
                  </td>

                  <td>
                    {product.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          No low stock products.
        </div>
      )}
    </section>

    {/* Recent Stock Movements */}
    <section className="recent-section">
      <div className="section-header">
        <div>
          <h2>Recent Stock Movements</h2>
          <p>
            Latest inventory activity
          </p>
        </div>
      </div>

      {dashboard?.recentMovements?.length > 0 ? (
        <div className="sales-table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.recentMovements.map((movement) => (
                <tr key={movement._id}>
                  <td className="invoice-number">
                    {movement.product?.name || "Unknown Product"}
                  </td>

                  <td>
                    {movement.type}
                  </td>

                  <td className="sale-total">
                    {movement.quantity}
                  </td>

                  <td>
                    {movement.reason || "-"}
                  </td>

                  <td>
                    {new Date(
                      movement.createdAt
                    ).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          No stock movements yet.
        </div>
      )}
    </section>

  </main>
  </div>
</div>

);
}

export default Dashboard;