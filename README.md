# Raja Oils - Full Stack E-commerce + Grinding Bookings

Raja Oils is a full-stack MERN-style application for selling products (oil, seeds, jaggery, nuts, etc.) with:

- Customer shopping flow (auth, listing, cart, checkout, account)
- Admin flow (products, orders, features, reports, grinding bookings)
- Product wishlist and reviews
- Grinding service booking system
- Payment integrations (PayPal + Razorpay)
- Email workflows (verification, booking, and notifications)

---

## Tech Stack

### Frontend (`client`)

- React 18
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS + Radix UI

### Backend (`server`)

- Node.js + Express
- MongoDB + Mongoose
- JWT auth (access/refresh flow)
- Nodemailer (email)
- Cloudinary (image upload)
- Razorpay + PayPal integrations

---

## Project Structure

```text
.
├─ client/              # React + Vite frontend
├─ server/              # Express backend API
├─ package.json         # Root-level package metadata
└─ .gitignore
```

---

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- MongoDB (Atlas or local)

---

## Quick Start

Open two terminals from project root.

### 1) Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2) Configure environment variables

Create a `.env` file inside `server/`.

Example:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/raja_oils

# Auth
JWT_SECRET=replace_with_a_strong_secret

# Client URL used in email links / CORS
CLIENT_URL=http://localhost:5173

# Email
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_or_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_or_app_password

# Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> Note: `.env` files are already ignored by `.gitignore`.

### 3) Run the backend

```bash
cd server
npm run dev
```

Backend defaults to: `http://localhost:5000`

### 4) Run the frontend

```bash
cd client
npm run dev
```

Frontend defaults to: `http://localhost:5173`

---

## Available Scripts

### `client/package.json`

- `npm run dev` - Start Vite dev server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### `server/package.json`

- `npm run dev` - Start API with nodemon
- `npm start` - Start API with node

---

## API Route Prefixes

The server mounts these main route groups:

- `/api/auth`
- `/api/admin/products`
- `/api/admin/orders`
- `/api/shop/products`
- `/api/shop/cart`
- `/api/shop/address`
- `/api/shop/order`
- `/api/shop/search`
- `/api/shop/review`
- `/api/shop/wishlist`
- `/api/bookings`
- `/api/common/feature`

---

## Important Notes

- Frontend API URLs are currently hardcoded to `http://localhost:5000` in multiple slices/helpers.
- In `server/server.js`, MongoDB is currently connected using a hardcoded connection string. For security and flexibility, migrate this to `process.env.MONGO_URI`.
- CORS in the server currently allows `http://localhost:5173` and `http://localhost:5175`.

---

## Existing Docs

For email setup and troubleshooting, see:

- `server/README-email-setup.md`
- `server/README-email-verification.md`
- `server/README-booking-emails.md`

---

## Troubleshooting

If `npm run dev` / `npm start` exits with code `1`:

1. Verify dependencies are installed in both `client` and `server`.
2. Verify `server/.env` exists and required keys are present.
3. Ensure MongoDB is reachable.
4. Check backend first (`server`) and confirm it starts on port `5000`.
5. Then start frontend and confirm it runs on `5173`.

Helpful server checks:

```bash
cd server
node check-env.js
node dotenv-check.js
```

---

## License

ISC (as declared in `server/package.json`).
