/**
 * Property-Based Tests for Post Slug Uniqueness
 * 
 * Tests Property 17: Post slug uniqueness
 * Validates Requirements 4.1, 4.2, 19.4
 * 
 * Uses fast-check for property-based testing with minimum 100 iterations
 */

import { describe, beforeAll, beforeEach, afterAll, test, expect } from '@jest/globals';
import fc from 'fast-check';
import sequelize from '../../../config/database.js';
import { setupAssociations } from '../../../config/associations.js';
import Post from '../post.model.js';
import User from '../../users/user.model.js';
import * as postService from '../post.service.js';
import * as userService from '../../users/user.service.js';

describe('Post Slug Uniqueness - Property Tests', () => {
  beforeAll(async () => {
    setupAssociations();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Post.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
  });

  describe('Property 17: Post slug uniqueness', () => {
    /**
     * For any post title, when creating a post, if a slug already exists,
     * the system should append a number to ensure uniqueness.
     */
    test('should generate unique slugs for posts with same title', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 }),
            count: fc.integer({ min: 2, max: 5 })
          }),
          async (data) => {
            // Create author
            const author = await userService.create({
              full_name: 'Test Author',
              email: `author-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create multiple posts with same title
            const posts = [];
            for (let i = 0; i < data.count; i++) {
              const post = await postService.create({
                title: data.title,
                content: data.content,
                status: 'draft'
              }, author.id);
              posts.push(post);
            }

            // Property: All slugs should be unique
            const slugs = posts.map(p => p.slug);
            const uniqueSlugs = new Set(slugs);
            expect(uniqueSlugs.size).toBe(slugs.length);

            // Property: First post should have base slug
            expect(posts[0].slug).not.toContain('-1');

            // Property: Subsequent posts should have numbered suffixes
            for (let i = 1; i < posts.length; i++) {
              expect(posts[i].slug).toMatch(/-\d+$/);
            }

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should maintain slug uniqueness across different titles', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              title: fc.string({ minLength: 5, maxLength: 100 }),
              content: fc.string({ minLength: 10, maxLength: 500 })
            }),
            { minLength: 3, maxLength: 10 }
          ),
          async (postsData) => {
            // Create author
            const author = await userService.create({
              full_name: 'Test Author',
              email: `author-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create posts
            const posts = [];
            for (const postData of postsData) {
              const post = await postService.create({
                title: postData.title,
                content: postData.content,
                status: 'draft'
              }, author.id);
              posts.push(post);
            }

            // Property: All slugs should be unique
            const slugs = posts.map(p => p.slug);
            const uniqueSlugs = new Set(slugs);
            expect(uniqueSlugs.size).toBe(slugs.length);

            // Property: Each slug should be retrievable
            for (const post of posts) {
              const found = await postService.findBySlug(post.slug);
              expect(found.id).toBe(post.id);
            }

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should handle special characters in titles when generating slugs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 })
          }),
          async (data) => {
            // Create author
            const author = await userService.create({
              full_name: 'Test Author',
              email: `author-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create post
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'draft'
            }, author.id);

            // Property: Slug should be URL-safe (lowercase alphanumeric with hyphens)
            expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

            // Property: Slug should not contain special characters
            expect(post.slug).not.toMatch(/[^a-z0-9-]/);

            // Property: Slug should not have consecutive hyphens
            expect(post.slug).not.toMatch(/--/);

            // Property: Slug should not start or end with hyphen
            expect(post.slug).not.toMatch(/^-|-$/);

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should preserve slug uniqueness when updating posts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title1: fc.string({ minLength: 5, maxLength: 100 }),
            title2: fc.string({ minLength: 5, maxLength: 100 }),
            newTitle: fc.string({ minLength: 5, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 })
          }),
          async (data) => {
            // Create author
            const author = await userService.create({
              full_name: 'Test Author',
              email: `author-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create two posts
            const post1 = await postService.create({
              title: data.title1,
              content: data.content,
              status: 'draft'
            }, author.id);

            const post2 = await postService.create({
              title: data.title2,
              content: data.content,
              status: 'draft'
            }, author.id);

            const originalSlug1 = post1.slug;
            const originalSlug2 = post2.slug;

            // Update post1 with new title
            const updated = await postService.update(post1.id, {
              title: data.newTitle
            }, author);

            // Property: Updated post should have new slug
            expect(updated.slug).not.toBe(originalSlug1);

            // Property: Other post's slug should remain unchanged
            const post2After = await postService.findById(post2.id);
            expect(post2After.slug).toBe(originalSlug2);

            // Property: Both slugs should still be unique
            expect(updated.slug).not.toBe(post2After.slug);

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should handle Vietnamese characters in slug generation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'Bài viết về Việt Nam',
            'Món ăn Việt Nam ngon',
            'Đất nước con người',
            'Thành phố Hồ Chí Minh',
            'Hà Nội thủ đô'
          ),
          async (title) => {
            // Create author
            const author = await userService.create({
              full_name: 'Test Author',
              email: `author-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create post with Vietnamese title
            const post = await postService.create({
              title,
              content: 'Test content',
              status: 'draft'
            }, author.id);

            // Property: Slug should be ASCII-only
            expect(post.slug).toMatch(/^[a-z0-9-]+$/);

            // Property: Vietnamese characters should be converted
            expect(post.slug).not.toMatch(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i);

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should handle empty or whitespace-only titles', async () => {
      const author = await userService.create({
        full_name: 'Test Author',
        email: `author-${Date.now()}@example.com`,
        password: 'password123',
        role: 'author',
        status: 'active'
      });

      // Try to create post with empty title
      await expect(
        postService.create({
          title: '',
          content: 'Test content',
          status: 'draft'
        }, author.id)
      ).rejects.toThrow();

      // Try to create post with whitespace-only title
      await expect(
        postService.create({
          title: '   ',
          content: 'Test content',
          status: 'draft'
        }, author.id)
      ).rejects.toThrow();

      // Clean up
      await userService.deleteUser(author.id);
    });

    test('should maintain slug uniqueness under concurrent creation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 }),
            count: fc.integer({ min: 3, max: 5 })
          }),
          async (data) => {
            // Create author
            const author = await userService.create({
              full_name: 'Test Author',
              email: `author-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create posts concurrently
            const createPromises = Array(data.count).fill(null).map(() =>
              postService.create({
                title: data.title,
                content: data.content,
                status: 'draft'
              }, author.id)
            );

            const posts = await Promise.all(createPromises);

            // Property: All slugs should be unique
            const slugs = posts.map(p => p.slug);
            const uniqueSlugs = new Set(slugs);
            expect(uniqueSlugs.size).toBe(slugs.length);

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 50 }
      );
    }, 120000);
  });
});
