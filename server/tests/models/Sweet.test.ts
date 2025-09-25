import { Sweet } from '../../src/models/Sweet';

describe('Sweet Model', () => {
  describe('Sweet Creation', () => {
    it('should create a sweet with valid data', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99,
        quantity: 100,
        description: 'Delicious milk chocolate bar'
      };

      // Act
      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      // Assert
      expect(savedSweet._id).toBeDefined();
      expect(savedSweet.name).toBe(sweetData.name);
      expect(savedSweet.category).toBe(sweetData.category);
      expect(savedSweet.price).toBe(sweetData.price);
      expect(savedSweet.quantity).toBe(sweetData.quantity);
      expect(savedSweet.description).toBe(sweetData.description);
      expect(savedSweet.createdAt).toBeDefined();
      expect(savedSweet.updatedAt).toBeDefined();
    });

    it('should require name field', async () => {
      // Arrange
      const sweetData = {
        category: 'chocolate',
        price: 2.99,
        quantity: 100
      };

      // Act & Assert
      const sweet = new Sweet(sweetData);
      await expect(sweet.save()).rejects.toThrow();
    });

    it('should require category field', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        price: 2.99,
        quantity: 100
      };

      // Act & Assert
      const sweet = new Sweet(sweetData);
      await expect(sweet.save()).rejects.toThrow();
    });

    it('should require price field', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        quantity: 100
      };

      // Act & Assert
      const sweet = new Sweet(sweetData);
      await expect(sweet.save()).rejects.toThrow();
    });

    it('should require quantity field', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99
      };

      // Act & Assert
      const sweet = new Sweet(sweetData);
      await expect(sweet.save()).rejects.toThrow();
    });

    it('should validate price is positive', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: -1.99,
        quantity: 100
      };

      // Act & Assert
      const sweet = new Sweet(sweetData);
      await expect(sweet.save()).rejects.toThrow();
    });

    it('should validate quantity is non-negative', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99,
        quantity: -5
      };

      // Act & Assert
      const sweet = new Sweet(sweetData);
      await expect(sweet.save()).rejects.toThrow();
    });

    it('should allow valid categories', async () => {
      const validCategories = ['chocolate', 'candy', 'gum', 'lollipop', 'other'];
      
      for (const category of validCategories) {
        // Arrange
        const sweetData = {
          name: `Test ${category}`,
          category,
          price: 1.99,
          quantity: 50
        };

        // Act
        const sweet = new Sweet(sweetData);
        const savedSweet = await sweet.save();

        // Assert
        expect(savedSweet.category).toBe(category);
      }
    });

    it('should reject invalid category', async () => {
      // Arrange
      const sweetData = {
        name: 'Test Sweet',
        category: 'invalid-category',
        price: 1.99,
        quantity: 50
      };

      // Act & Assert
      const sweet = new Sweet(sweetData);
      await expect(sweet.save()).rejects.toThrow();
    });
  });

  describe('Sweet Methods', () => {
    it('should check if sweet is in stock', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99,
        quantity: 5
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      // Act & Assert
      expect(savedSweet.isInStock()).toBe(true);
    });

    it('should check if sweet is out of stock', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99,
        quantity: 0
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      // Act & Assert
      expect(savedSweet.isInStock()).toBe(false);
    });

    it('should decrease quantity when purchased', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99,
        quantity: 10
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      // Act
      const result = await savedSweet.purchase(3);

      // Assert
      expect(result.success).toBe(true);
      expect(savedSweet.quantity).toBe(7);
    });

    it('should not allow purchase when insufficient stock', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99,
        quantity: 2
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      // Act
      const result = await savedSweet.purchase(5);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient stock');
      expect(savedSweet.quantity).toBe(2); // Should not change
    });

    it('should increase quantity when restocked', async () => {
      // Arrange
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'chocolate',
        price: 2.99,
        quantity: 5
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      // Act
      await savedSweet.restock(10);

      // Assert
      expect(savedSweet.quantity).toBe(15);
    });
  });
});