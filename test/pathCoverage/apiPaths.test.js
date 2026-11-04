const request = require('supertest');
const { expect } = require('chai');

const API = process.env.API_URL || 'http://localhost:3000';

describe('API path coverage', function () {
  it('covers GET /healthcheck', async function () {
    const response = await request(API).get('/healthcheck');

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ status: 'ok' });
  });

  it('covers POST /login', async function () {
    const response = await request(API).post('/login').send({
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token').that.is.a('string').and.is.not.empty;
  });

  it('covers POST /register', async function () {
    const response = await request(API).post('/register').send({
      name: 'Dave Miller',
      email: 'dave@example.com',
      password: 'password123',
    });

    expect(response.status).to.equal(201);
    expect(response.body).to.deep.equal({
      id: 4,
      name: 'Dave Miller',
      email: 'dave@example.com',
    });
  });

  it('covers POST /checkout', async function () {
    const login = await request(API).post('/login').send({
      email: 'alice@example.com',
      password: 'password123',
    });

    const response = await request(API)
      .post('/checkout')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({
        items: [{ productId: 1, quantity: 1 }],
        paymentMethod: 'cash',
      });

    expect(response.status).to.equal(200);
    expect(response.body.paymentMethod).to.equal('cash');
    expect(response.body.subtotal).to.equal(100);
    expect(response.body.discount).to.equal(10);
    expect(response.body.total).to.equal(90);
  });

  it('covers GET /api-docs', async function () {
    const response = await request(API).get('/api-docs/');

    expect(response.status).to.equal(200);
    expect(response.headers['content-type']).to.match(/html/);
    expect(response.text).to.include('Swagger UI');
  });
});
