import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Post Model
 * Represents blog posts/articles
 */
const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Title is required'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(280),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Slug is required'
      }
    }
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  featured_image_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'media',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'draft',
    validate: {
      isIn: {
        args: [['draft', 'published', 'archived']],
        msg: 'Status must be draft, published, or archived'
      }
    }
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'View count must be non-negative'
      }
    }
  },
  seo_title: {
    type: DataTypes.STRING(70),
    allowNull: true,
    validate: {
      len: {
        args: [0, 70],
        msg: 'SEO title must not exceed 70 characters'
      }
    }
  },
  seo_description: {
    type: DataTypes.STRING(160),
    allowNull: true,
    validate: {
      len: {
        args: [0, 160],
        msg: 'SEO description must not exceed 160 characters'
      }
    }
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['slug'],
      unique: true
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['author_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['published_at']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeSave: async (post, options) => {
      // Set published_at timestamp when status changes to published
      if (post.changed('status') && post.status === 'published' && !post.published_at) {
        post.published_at = new Date();
      }
      
      // Clear published_at when status changes from published to draft
      if (post.changed('status') && post.status === 'draft') {
        post.published_at = null;
      }
    }
  }
});

/**
 * Instance method to check if post is published
 * @returns {boolean}
 */
Post.prototype.isPublished = function() {
  return this.status === 'published';
};

/**
 * Instance method to check if post is draft
 * @returns {boolean}
 */
Post.prototype.isDraft = function() {
  return this.status === 'draft';
};

/**
 * Instance method to increment view count
 * @returns {Promise<void>}
 */
Post.prototype.incrementViewCount = async function() {
  this.view_count += 1;
  await this.save({ fields: ['view_count'] });
};

/**
 * Instance method to get reading time estimate (words per minute)
 * @param {number} wpm - Words per minute (default 200)
 * @returns {number} - Estimated reading time in minutes
 */
Post.prototype.getReadingTime = function(wpm = 200) {
  if (!this.content) return 0;
  
  // Strip HTML tags and count words
  const text = this.content.replace(/<[^>]*>/g, '');
  const wordCount = text.trim().split(/\s+/).length;
  
  return Math.ceil(wordCount / wpm);
};

export default Post;
