/**
 * Property-Based Tests for Post Publishing Timestamp
 * 
 * Tests Property 18: Publishing sets timestamp
 * Tests Property 19: Draft posts have no publish timestamp
 * Validates Requirements 4.3, 4.4, 20.2
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

describe('Post Publishing Timestamp - Property Tests', () => {
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

  describe('Property 18: Publishing sets timestamp', () => {
    /**
     * For any post, when the status is changed to published,
     * the published_at timestamp should be set to the current time.
     */
    test('should set published_at when status changes to published', async () => {
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

            // Create draft post
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'draft'
            }, author.id);

            // Property: Draft post should not have published_at
            expect(post.published_at).toBeNull();

            const beforePublish = new Date();

            // Change status to published
            const published = await postService.updateStatus(post.id, 'published', author);

            const afterPublish = new Date();

            // Property: Published post should have published_at timestamp
            expect(published.published_at).not.toBeNull();
            expect(published.published_at).toBeInstanceOf(Date);

            // Property: Timestamp should be between before and after publish time
            expect(published.published_at.getTime()).toBeGreaterThanOrEqual(beforePublish.getTime() - 1000);
            expect(published.published_at.getTime()).toBeLessThanOrEqual(afterPublish.getTime() + 1000);

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should set published_at when creating post with published status', async () => {
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

            const beforeCreate = new Date();

            // Create post with published status
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'published'
            }, author.id);

            const afterCreate = new Date();

            // Property: Published post should have published_at timestamp
            expect(post.published_at).not.toBeNull();
            expect(post.published_at).toBeInstanceOf(Date);

            // Property: Timestamp should be recent
            expect(post.published_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime() - 1000);
            expect(post.published_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime() + 1000);

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should not change published_at when updating published post', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 100 }),
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

            // Create published post
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'published'
            }, author.id);

            const originalPublishedAt = post.published_at;

            // Wait a bit to ensure time difference
            await new Promise(resolve => setTimeout(resolve, 100));

            // Update post content
            const updated = await postService.update(post.id, {
              title: data.newTitle,
              content: 'Updated content'
            }, author);

            // Property: published_at should remain unchanged
            expect(updated.published_at.getTime()).toBe(originalPublishedAt.getTime());

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should handle multiple status transitions correctly', async () => {
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

            // Create draft post
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'draft'
            }, author.id);

            // Property: Draft should have no timestamp
            expect(post.published_at).toBeNull();

            // Publish
            const published = await postService.updateStatus(post.id, 'published', author);
            const firstPublishedAt = published.published_at;

            // Property: Should have timestamp after publishing
            expect(firstPublishedAt).not.toBeNull();

            // Change back to draft
            const draft = await postService.updateStatus(post.id, 'draft', author);

            // Property: Timestamp should be cleared when changing to draft
            expect(draft.published_at).toBeNull();

            // Publish again
            const republished = await postService.updateStatus(post.id, 'published', author);

            // Property: Should have new timestamp
            expect(republished.published_at).not.toBeNull();
            expect(republished.published_at.getTime()).toBeGreaterThanOrEqual(firstPublishedAt.getTime());

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);
  });

  describe('Property 19: Draft posts have no publish timestamp', () => {
    /**
     * For any post saved as draft, the published_at field should be null.
     */
    test('should have null published_at for draft posts', async () => {
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

            // Create draft post
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'draft'
            }, author.id);

            // Property: Draft post should have null published_at
            expect(post.published_at).toBeNull();

            // Verify in database
            const dbPost = await Post.findByPk(post.id);
            expect(dbPost.published_at).toBeNull();

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should clear published_at when changing from published to draft', async () => {
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

            // Create published post
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'published'
            }, author.id);

            // Property: Published post should have timestamp
            expect(post.published_at).not.toBeNull();

            // Change to draft
            const draft = await postService.updateStatus(post.id, 'draft', author);

            // Property: Draft should have null published_at
            expect(draft.published_at).toBeNull();

            // Verify in database
            const dbPost = await Post.findByPk(draft.id);
            expect(dbPost.published_at).toBeNull();

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should maintain null published_at for archived posts that were never published', async () => {
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

            // Create draft post
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'draft'
            }, author.id);

            // Change to archived without publishing
            const archived = await postService.updateStatus(post.id, 'archived', author);

            // Property: Should still have null published_at
            expect(archived.published_at).toBeNull();

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should preserve published_at when changing from published to archived', async () => {
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

            // Create published post
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'published'
            }, author.id);

            const originalPublishedAt = post.published_at;

            // Change to archived
            const archived = await postService.updateStatus(post.id, 'archived', author);

            // Property: Should preserve published_at timestamp
            expect(archived.published_at).not.toBeNull();
            expect(archived.published_at.getTime()).toBe(originalPublishedAt.getTime());

            // Clean up
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);
  });
});
