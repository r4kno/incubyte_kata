import request from 'supertest';
import { app } from '../../src/app';
import { Sweet } from '../../src/models/Sweet';
import { User } from '../../src/models/User';
import { AuthService } from '../../src/services/AuthService';

describe('SweetController', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;

  beforeEach(async () => {
    // Clear database
    await Sweet.deleteMany({});
    await User.deleteMany({});

    // Create test user
    const authService = new AuthService();
    const userResult = await authService.register({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });
    userToken = userResult.token!;
    userId = userResult.user!._id;

    // Create test admin
    const adminResult = await authService.register({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = adminResult.token!;
    adminId = adminResult.user!._id;
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet when admin is authenticated', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.50,
        quantity: 100,
        description: 'Delicious milk chocolate'
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(sweetData.name);
      expect(response.body.data.category).toBe(sweetData.category);
      expect(response.body.data.price).toBe(sweetData.price);
      expect(response.body.data.quantity).toBe(sweetData.quantity);
    });

    it('should return 401 when user is not authenticated', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.50,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when category is invalid', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'invalid-category',
        price: 2.50,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 when regular user tries to create sweet', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.50,
        quantity: 100,
        description: 'Delicious milk chocolate'
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      // Create test sweets
      await Sweet.create([
        {
          name: 'Chocolate Bar',
          category: 'chocolate',
          price: 2.50,
          quantity: 100
        },
        {
          name: 'Gummy Bears',
          category: 'candy',
          price: 1.75,
          quantity: 50
        }
      ]);
    });

    it('should return all sweets when user is authenticated', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should return 401 when user is not authenticated', async () => {
      const response = await request(app)
        .get('/api/sweets');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      await Sweet.create([
        {
          name: 'Dark Chocolate Bar',
          category: 'chocolate',
          price: 3.00,
          quantity: 25
        },
        {
          name: 'Milk Chocolate Bar',
          category: 'chocolate',
          price: 2.50,
          quantity: 50
        },
        {
          name: 'Sour Gummy Worms',
          category: 'candy',
          price: 1.25,
          quantity: 75
        }
      ]);
    });

    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=chocolate')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=candy')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('candy');
    });

    it('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=2.00&maxPrice=3.00')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no sweets match criteria', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=nonexistent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return 401 when user is not authenticated', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=chocolate');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Original Sweet',
        category: 'candy',
        price: 1.00,
        quantity: 10
      });
      sweetId = (sweet._id as any).toString();
    });

    it('should update sweet when admin is authenticated', async () => {
      const updateData = {
        name: 'Updated Sweet',
        price: 1.50
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

    it('should return 404 when sweet does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Sweet' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when invalid ID format', async () => {
      const response = await request(app)
        .put('/api/sweets/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Sweet' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 when user is not authenticated', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .send({ name: 'Updated Sweet' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 when regular user tries to update sweet', async () => {
      const updateData = {
        name: 'Updated Sweet',
        price: 1.50
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Sweet to Delete',
        category: 'candy',
        price: 1.00,
        quantity: 10
      });
      sweetId = (sweet._id as any).toString();
    });

    it('should delete sweet when user is admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Sweet deleted successfully');
    });

    it('should return 403 when user is not admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Admin access required');
    });

    it('should return 404 when sweet does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 when user is not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Sweet to Purchase',
        category: 'candy',
        price: 2.00,
        quantity: 10
      });
      sweetId = (sweet._id as any).toString();
    });

    it('should purchase sweet and decrease quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 3 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(7);
      expect(response.body.message).toBe('Purchase successful');
    });

    it('should return 400 when insufficient stock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 15 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient stock');
    });

    it('should return 400 when quantity is not provided', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when quantity is less than 1', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 0 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 when user is not authenticated', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .send({ quantity: 3 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Sweet to Restock',
        category: 'candy',
        price: 2.00,
        quantity: 5
      });
      sweetId = (sweet._id as any).toString();
    });

    it('should restock sweet when user is admin', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(25);
      expect(response.body.message).toBe('Restock successful');
    });

    it('should return 403 when user is not admin', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 20 });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Admin access required');
    });

    it('should return 400 when quantity is not provided', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when sweet does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post(`/api/sweets/${fakeId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 when user is not authenticated', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .send({ quantity: 10 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});