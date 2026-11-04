const products = require('../model/productModel');

const ALLOWED_PAYMENT_METHODS = ['cash', 'credit_card'];

function checkout({ items, paymentMethod }) {
  if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
    const error = new Error('Payment method must be cash or credit card');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('At least one item is required');
    error.statusCode = 400;
    throw error;
  }

  let subtotal = 0;
  const lineItems = items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) {
      const error = new Error(`Product ${item.productId} not found`);
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      const error = new Error('Quantity must be a positive integer');
      error.statusCode = 400;
      throw error;
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    return {
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal,
    };
  });

  const discountRate = paymentMethod === 'cash' ? 0.1 : 0;
  const discount = Number((subtotal * discountRate).toFixed(2));
  const total = Number((subtotal - discount).toFixed(2));

  return {
    paymentMethod,
    subtotal: Number(subtotal.toFixed(2)),
    discount,
    total,
    items: lineItems,
  };
}

module.exports = {
  checkout,
};
