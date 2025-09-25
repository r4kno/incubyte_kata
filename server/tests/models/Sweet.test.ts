import { Sweet } from '../../src/models/Sweet';

describe('Sweet Model - Critical Validations', () => {
  beforeEach(async () => {
    await Sweet.deleteMany({});
  });

  describe('Business Logic Validations', () => {
    it('should enforce required fields', async () => {
      const emptySweet = new Sweet({});
      
      await expect(emptySweet.save()).rejects.toThrow();
    });

    it('should validate positive price constraint', async () => {
      const sweetWithNegativePrice = new Sweet({
        name: 'Test Sweet',
        category: 'chocolate',
        price: -1.99, // Invalid: negative price
        quantity: 100
      });

      await expect(sweetWithNegativePrice.save()).rejects.toThrow();
    });

    it('should validate non-negative quantity constraint', async () => {
      const sweetWithNegativeQuantity = new Sweet({
        name: 'Test Sweet', 
        category: 'chocolate',
        price: 2.99,
        quantity: -10 // Invalid: negative quantity
      });

      await expect(sweetWithNegativeQuantity.save()).rejects.toThrow();
    });

    it('should validate category enum values', async () => {
      const sweetWithInvalidCategory = new Sweet({
        name: 'Test Sweet',
        category: 'invalid-category', // Should only accept predefined categories
        price: 2.99,
        quantity: 100
      });

      await expect(sweetWithInvalidCategory.save()).rejects.toThrow();
    });

    it('should save valid sweet successfully', async () => {
      const validSweet = new Sweet({
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99,
        quantity: 100,
        description: 'Delicious chocolate bar'
      });

      const savedSweet = await validSweet.save();
      
      expect(savedSweet._id).toBeDefined();
      expect(savedSweet.name).toBe('Chocolate Bar');
      expect(savedSweet.category).toBe('chocolate');
      expect(savedSweet.price).toBe(2.99);
      expect(savedSweet.quantity).toBe(100);
    });
  });
});