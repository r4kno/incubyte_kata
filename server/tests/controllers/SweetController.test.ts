import request from 'supertest';
import { app } from '../../src/app';
import { Sweet } from '../../src/models/Sweet';
import { User } from '../../src/models/User';
import { AuthService } from '../../src/services/AuthService';

describe('SweetController - Critical Tests', () => {
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    await Sweet.deleteMany({});
    await User.deleteMany({});

    const authService = new AuthService();
    
    // Create user and admin for permission tests
    const userResult = await authService.register({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });
    userToken = userResult.token!;

    const adminResult = await authService.register({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = adminResult.token!;
  });

  describe('Authorization & Security', () => {
    it('should allow admin to create sweets', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.50,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(sweetData.name);
    });

    it('should reject unauthorized access to admin endpoints', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({ name: 'Test', category: 'candy', price: 1, quantity: 10 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject user access to admin-only endpoints', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test', category: 'candy', price: 1, quantity: 10 });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Business Logic & Data Validation', () => {
    it('should validate required fields for sweet creation', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}); // Missing all required fields

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate business rules (price > 0, quantity >= 0)', async () => {
      const invalidSweet = {
        name: 'Test Sweet',
        category: 'chocolate',
        price: -1, // Invalid: negative price
        quantity: -5 // Invalid: negative quantity
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSweet);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should allow users to view sweets (public endpoint)', async () => {
      // Create a sweet first
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'chocolate',
          price: 2.50,
          quantity: 100
        });

      // Any user should be able to view sweets
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    let sweetId: string;

    beforeEach(async () => {
      // Create a sweet for update/delete tests
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Sweet',
          category: 'chocolate',
          price: 2.50,
          quantity: 100
        });
      sweetId = response.body.data._id;
    });

    it('should allow admin to update sweets', async () => {
      const updateData = {
        name: 'Updated Sweet',
        price: 3.00
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
    });

    it('should allow admin to delete sweets', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify sweet is actually deleted
      const getResponse = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(getResponse.status).toBe(404);
    });

    it('should prevent users from modifying sweets', async () => {
      const updateResponse = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked Sweet' });

      expect(updateResponse.status).toBe(403);

      const deleteResponse = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(deleteResponse.status).toBe(403);
    });
  });
});