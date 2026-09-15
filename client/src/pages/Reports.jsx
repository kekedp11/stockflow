import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import "./Reports.css";

function Reports() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setError("");
      setLoading(true);

      const [salesResponse, productsResponse, movementsResponse] =
        await Promise.all([
          axiosInstance.get("/sales"),
          axiosInstance.get("/products", {
            params: {
              limit: 100,
            },
          }),
          axiosInstance.get("/stock/movements"),
        ]);

      setSales(salesResponse.data.sales);
      setProducts(productsResponse.data.products);
      setMovements(movementsResponse.data.movements);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalTransactions = sales.length;

  const totalRevenue = sales.reduce(
    (total, sale) => total + sale.total,
    0
  );

  const totalItemsSold = sales.reduce(
    (total, sale) =>
      total +
      sale.items.reduce(
        (itemTotal, item) => itemTotal + item.quantity,
        0
      ),
    0
  );

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const lowStockProducts = products.filter(
    (product) => product.stock <= product.minimumStock
  ).length;

  const totalStockIn = movements
    .filter((movement) => movement.type === "IN")
    .reduce(
      (total, movement) => total + movement.quantity,
      0
    );

  const totalStockOut = movements
    .filter(
      (movement) =>
        movement.type === "OUT" ||
        movement.type === "SALE"
    )
    .reduce(
      (total, movement) => total + movement.quantity,
      0
    );

  const productSales = {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const productId = item.product?._id;

      if (!productId) {
        return;
      }

      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product.name,
          sku: item.product.sku,
          quantity: 0,
        };
      }

      productSales[productId].quantity += item.quantity;
    });
  });

  const bestSellingProduct = Object.values(productSales).sort(
    (a, b) => b.quantity - a.quantity
  )[0];

  if (loading) {
    return <p>Loading reports...</p>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="reports-page">
        <header className="reports-header">
          <div>
            <h1>Reports</h1>
            <p>View inventory and sales reports.</p>
          </div>
        </header>

        <main className="reports-content">
          {error && (
            <div className="reports-error">
              {error}
            </div>
          )}

          <section className="reports-section">
            <div className="section-header">
              <h2>Sales Report</h2>
              <p>Sales performance and transaction summary.</p>
            </div>

            <div className="report-summary-grid">
              <div className="report-card">
                <span>Total Transactions</span>
                <strong>{totalTransactions}</strong>
              </div>

              <div className="report-card">
                <span>Total Revenue</span>
                <strong>
                  Rp {totalRevenue.toLocaleString("id-ID")}
                </strong>
              </div>

              <div className="report-card">
                <span>Total Items Sold</span>
                <strong>{totalItemsSold}</strong>
              </div>

              <div className="report-card best-selling-card">
                <span>Best Selling Product</span>

                {bestSellingProduct ? (
                  <>
                    <strong>
                      {bestSellingProduct.name}
                    </strong>

                    <small>
                      {bestSellingProduct.sku} ·{" "}
                      {bestSellingProduct.quantity} items sold
                    </small>
                  </>
                ) : (
                  <strong>No sales yet</strong>
                )}
              </div>
            </div>
          </section>

          <section className="reports-section">
            <div className="section-header">
              <h2>Stock Report</h2>
              <p>Inventory levels and stock movement summary.</p>
            </div>

            <div className="report-summary-grid">
              <div className="report-card">
                <span>Total Products</span>
                <strong>{totalProducts}</strong>
              </div>

              <div className="report-card">
                <span>Total Stock</span>
                <strong>{totalStock}</strong>
              </div>

              <div className="report-card">
                <span>Low Stock</span>
                <strong>{lowStockProducts}</strong>
              </div>

              <div className="report-card">
                <span>Stock In</span>
                <strong>{totalStockIn}</strong>
              </div>

              <div className="report-card">
                <span>Stock Out</span>
                <strong>{totalStockOut}</strong>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Reports;