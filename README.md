# StockFlow

StockFlow is a full-stack inventory and sales management system designed to help businesses manage products, inventory, sales transactions, and operational reports from a single dashboard.

## Features

- JWT-based authentication
- Role-based access control
- Product management
- Product search and filtering
- Stock In, Stock Out, and stock adjustment
- Stock movement history
- Sales transaction management
- Automatic stock updates after sales
- Dashboard with inventory and sales summaries
- Sales and inventory reports
- Responsive interface for desktop, tablet, and mobile

## Tech Stack

### Frontend

- React
- React Router
- Axios
- Vite
- CSS

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- CORS
- dotenv

## Project Structure

```text
stockflow/
├── client/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── routes/
│       ├── assets/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── server.js
│
└── README.md