import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import "./Sales.css";

function Sales() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = async () => {
    try {
      setError("");

      const response = await axiosInstance.get("/products", {
        params: {
          limit: 100,
        },
      });

      setProducts(response.data.products);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
  try {
    setError("");

    const response = await axiosInstance.get("/sales");

    setSales(response.data.sales);
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to load sales."
    );
  }
};

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");
      setSubmitting(true);

      const payload = {
        customerName: customerName.trim() || "Walk-in Customer",
        items: [
          {
            productId,
            quantity: Number(quantity),
          },
        ],
      };

      const response = await axiosInstance.post(
        "/sales",
        payload
      );

      setSuccess(
        `Sale created successfully. Invoice: ${response.data.sale.invoiceNumber}`
      );

      setCustomerName("");
      setProductId("");
      setQuantity(1);

      await fetchProducts();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create sale."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading sales...</p>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="sales-page">
        <header className="sales-header">
          <div>
            <h1>Sales</h1>
            <p>Manage sales transactions.</p>
          </div>
        </header>

        <main className="sales-content">
          <section className="sales-form-section">
            <div className="section-header">
              <h2>New Sale</h2>
              <p>Create a new sales transaction.</p>
            </div>

            {error && (
              <div className="sales-message error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="sales-message success-message">
                {success}
              </div>
            )}

            <form
              className="sales-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label>Customer Name</label>

                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Product</label>

                <select
                  value={productId}
                  onChange={(event) =>
                    setProductId(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select a product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                      disabled={product.stock <= 0}
                    >
                      {product.name} — Stock: {product.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="create-sale-button"
                disabled={submitting}
              >
                {submitting ? "Creating Sale..." : "Create Sale"}
              </button>
            </form>
          </section>

          <section className="sales-history-section">
            <div className="section-header">
                <h2>Sales History</h2>
                <p>View recent sales transactions.</p>
            </div>

            {sales.length === 0 ? (
                <p>No sales found.</p>
            ) : (
                <div className="sales-table-wrapper">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale._id}>
                                <td>{sale.invoiceNumber}</td>

                                <td>{sale.customerName}</td>

                                <td>
                                    {sale.items
                                        .map((item) => item.product.name)
                                        .join(", ")}
                                </td>

                                <td>
                                    {sale.items.reduce(
                                        (total, item) => total + item.quantity,
                                        0
                                    )}
                                </td>

                                <td>
                                    Rp {sale.total.toLocaleString("id-ID")}
                                </td>

                                <td>
                                    {new Date(sale.createdAt).toLocaleDateString(
                                        "id-ID"
                                    )}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
        </main>
      </div>
    </div>
  );
}

export default Sales;