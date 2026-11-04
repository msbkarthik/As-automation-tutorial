const jwt = require('jsonwebtoken');
const users = require('../model/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-dev-secret';

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function register({ name, email, password }) {
  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = String(email).toLowerCase();
  const exists = users.find((user) => user.email.toLowerCase() === normalizedEmail);
  if (exists) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const nextId = users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
  const user = { id: nextId, name, email: normalizedEmail, password };
  users.push(user);
  return publicUser(user);
}

function login({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = users.find(
    (candidate) =>
      candidate.email.toLowerCase() === String(email).toLowerCase() &&
      candidate.password === password
  );

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  return { token };
}

module.exports = {
  JWT_SECRET,
  register,
  login,
};
