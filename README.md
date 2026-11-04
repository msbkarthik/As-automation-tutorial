# E-commerce REST API

## Description

In-memory e-commerce REST API built with JavaScript and Express. A consumer can register, log in to receive a JWT, and check out a cart. Catalog and accounts live in process memory and reset when the server restarts. No database is used.

Business endpoints:

- `POST /register`
- `POST /login`
- `POST /checkout`
- `GET /healthcheck`

`GET /api-docs` renders the Swagger UI from `swagger.yaml` in the project root.

## Installation

Requirements: Node.js 18 or newer.

```bash
npm install
```

## How to Run

```bash
npm start
```

The API listens on `http://localhost:3000`. Override the port with `PORT` and the signing key with `JWT_SECRET`.

## Rules

Checkout follows three rules:

1. The checkout accepts only cash (`cash`) or credit card (`credit_card`).
2. Cash gives a 10% discount on the subtotal. Credit card has no discount.
3. Only authenticated users can check out. Send `Authorization: Bearer <token>` from `POST /login`.

Other behavior:

- Register requires `name`, `email`, and `password`. Duplicate emails are rejected.
- Login requires `email` and `password` and returns a JWT valid for 1 hour.
- Each checkout item needs an existing `productId` and a positive integer `quantity`.
- Prices are fixed on the product. The discount is `subtotal * 0.10` for cash and `0` for credit card. `total` is `subtotal - discount`.

## Existent Data

The models start with three users and three products.

### Users

| id | name | email | password |
| --- | --- | --- | --- |
| 1 | Alice Johnson | alice@example.com | password123 |
| 2 | Bob Smith | bob@example.com | password123 |
| 3 | Carol Davis | carol@example.com | password123 |

### Products

| id | name | price |
| --- | --- | --- |
| 1 | Mechanical Keyboard | 100 |
| 2 | Wireless Mouse | 50 |
| 3 | USB-C Hub | 80 |

Example cash checkout of product `1` with quantity `1`: subtotal `100`, discount `10`, total `90`.

Example credit card checkout of the same item: subtotal `100`, discount `0`, total `100`.

## How to Use the Rest API

Base URL: `http://localhost:3000`

Interactive docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Health check

```bash
curl -s http://localhost:3000/healthcheck
```

Expected `200`:

```json
{ "status": "ok" }
```

### Register

```bash
curl -s -X POST http://localhost:3000/register -H "Content-Type: application/json" -d '{"name":"Dave Miller","email":"dave@example.com","password":"password123"}'
```

Expected `201`:

```json
{ "id": 4, "name": "Dave Miller", "email": "dave@example.com" }
```

### Login

```bash
curl -s -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"password123"}'
```

Expected `200`:

```json
{ "token": "<jwt>" }
```

### Checkout with cash (10% discount)

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"password123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0,"utf8")).token')
curl -s -X POST http://localhost:3000/checkout -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"items":[{"productId":1,"quantity":1}],"paymentMethod":"cash"}'
```

Expected `200`:

```json
{
  "paymentMethod": "cash",
  "subtotal": 100,
  "discount": 10,
  "total": 90,
  "items": [
    {
      "productId": 1,
      "name": "Mechanical Keyboard",
      "quantity": 1,
      "unitPrice": 100,
      "lineTotal": 100
    }
  ]
}
```

### Checkout with credit card (no discount)

```bash
curl -s -X POST http://localhost:3000/checkout -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"items":[{"productId":1,"quantity":1}],"paymentMethod":"credit_card"}'
```

Expected `200` with `discount` `0` and `total` `100`.

### Rejected payment method

```bash
curl -s -X POST http://localhost:3000/checkout -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"items":[{"productId":1,"quantity":1}],"paymentMethod":"debit"}'
```

Expected `400`:

```json
{ "message": "Payment method must be cash or credit card" }
```
