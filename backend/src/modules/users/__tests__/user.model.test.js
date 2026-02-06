import { jest } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';

// Create test database instance
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false
});

// Define User model for testing
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 255]
    }
  },
  avatar_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'editor', 'author'),
    allowNull: false,
    defaultValue: 'author'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Add instance methods
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

User.prototype.isEditorOrAdmin = function() {
  return this.role === 'editor' || this.role === 'admin';
};

User.prototype.isActive = function() {
  return this.status === 'active';
};

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  describe('Model Definition', () => {
    it('should have correct table name', () => {
      expect(User.tableName).toBe('users');
    });

    it('should have all required fields', () => {
      const attributes = User.getAttributes();
      expect(attributes).toHaveProperty('id');
      expect(attributes).toHaveProperty('full_name');
      expect(attributes).toHaveProperty('email');
      expect(attributes).toHaveProperty('password');
      expect(attributes).toHaveProperty('avatar_id');
      expect(attributes).toHaveProperty('role');
      expect(attributes).toHaveProperty('status');
    });
  });

  describe('Validations', () => {
    it('should create user with valid data', async () => {
      const user = await User.create({
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      expect(user.id).toBeDefined();
      expect(user.full_name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('author');
      expect(user.status).toBe('active');
    });

    it('should fail without full_name', async () => {
      await expect(
        User.create({
          email: 'john@example.com',
          password: 'password123'
        })
      ).rejects.toThrow();
    });

    it('should fail without email', async () => {
      await expect(
        User.create({
          full_name: 'John Doe',
          password: 'password123'
        })
      ).rejects.toThrow();
    });

    it('should fail without password', async () => {
      await expect(
        User.create({
          full_name: 'John Doe',
          email: 'john@example.com'
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid email format', async () => {
      await expect(
        User.create({
          full_name: 'John Doe',
          email: 'invalid-email',
          password: 'password123'
        })
      ).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      await expect(
        User.create({
          full_name: 'Jane Doe',
          email: 'john@example.com',
          password: 'password456'
        })
      ).rejects.toThrow();
    });

    it('should fail with password less than 6 characters', async () => {
      await expect(
        User.create({
          full_name: 'John Doe',
          email: 'john@example.com',
          password: '12345'
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid role', async () => {
      await expect(
        User.create({
          full_name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'invalid_role'
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid status', async () => {
      await expect(
        User.create({
          full_name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          status: 'invalid_status'
        })
      ).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should default role to author', async () => {
      const user = await User.create({
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      expect(user.role).toBe('author');
    });

    it('should default status to active', async () => {
      const user = await User.create({
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      expect(user.status).toBe('active');
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin',
        status: 'active'
      });
    });

    describe('toJSON', () => {
      it('should exclude password from JSON', () => {
        const json = user.toJSON();
        expect(json).not.toHaveProperty('password');
        expect(json).toHaveProperty('email');
        expect(json).toHaveProperty('full_name');
      });
    });

    describe('isAdmin', () => {
      it('should return true for admin role', () => {
        expect(user.isAdmin()).toBe(true);
      });

      it('should return false for non-admin role', async () => {
        const author = await User.create({
          full_name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'author'
        });

        expect(author.isAdmin()).toBe(false);
      });
    });

    describe('isEditorOrAdmin', () => {
      it('should return true for admin', () => {
        expect(user.isEditorOrAdmin()).toBe(true);
      });

      it('should return true for editor', async () => {
        const editor = await User.create({
          full_name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'editor'
        });

        expect(editor.isEditorOrAdmin()).toBe(true);
      });

      it('should return false for author', async () => {
        const author = await User.create({
          full_name: 'Bob Smith',
          email: 'bob@example.com',
          password: 'password123',
          role: 'author'
        });

        expect(author.isEditorOrAdmin()).toBe(false);
      });
    });

    describe('isActive', () => {
      it('should return true for active status', () => {
        expect(user.isActive()).toBe(true);
      });

      it('should return false for inactive status', async () => {
        const inactiveUser = await User.create({
          full_name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          status: 'inactive'
        });

        expect(inactiveUser.isActive()).toBe(false);
      });
    });
  });

  describe('Timestamps', () => {
    it('should have created_at timestamp', async () => {
      const user = await User.create({
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      expect(user.created_at).toBeDefined();
      expect(user.created_at).toBeInstanceOf(Date);
    });

    it('should have updated_at timestamp', async () => {
      const user = await User.create({
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      expect(user.updated_at).toBeDefined();
      expect(user.updated_at).toBeInstanceOf(Date);
    });

    it('should update updated_at on modification', async () => {
      const user = await User.create({
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      const originalUpdatedAt = user.updated_at;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      user.full_name = 'John Updated';
      await user.save();

      expect(user.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
