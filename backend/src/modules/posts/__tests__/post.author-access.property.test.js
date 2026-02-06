/**
 * Property-Based Tests for Post Author Access Control
 * 
 * Tests Property 24: Author sees only own posts
 * Tests Property 25: Editors see all posts
 * Validates Requirements 4.9, 4.10, 15.1, 15.2
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

describe('Post Author Access Control - Property Tests', () => {
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

  describe('Property 24: Author sees only own posts', () => {
    /**
     * For any user with author role, when viewing the post list,
     * only posts created by that author should be returned.
     */
    test('should return only own posts for author role', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            author1Posts: fc.integer({ min: 1, max: 5 }),
            author2Posts: fc.integer({ min: 1, max: 5 })
          }),
          async (data) => {
            // Create two authors
            const author1 = await userService.create({
              full_name: 'Author One',
              email: `author1-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            const author2 = await userService.create({
              full_name: 'Author Two',
              email: `author2-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create posts for author1
            for (let i = 0; i < data.author1Posts; i++) {
              await postService.create({
                title: `Author1 Post ${i}`,
                content: 'Content',
                status: 'draft'
              }, author1.id);
            }

            // Create posts for author2
            for (let i = 0; i < data.author2Posts; i++) {
              await postService.create({
                title: `Author2 Post ${i}`,
                content: 'Content',
                status: 'draft'
              }, author2.id);
            }

            // Get posts as author1
            const author1Result = await postService.findAll({}, author1);

            // Property: Author1 should only see their own posts
            expect(author1Result.posts.length).toBe(data.author1Posts);
            author1Result.posts.forEach(post => {
              expect(post.author_id).toBe(author1.id);
            });

            // Get posts as author2
            const author2Result = await postService.findAll({}, author2);

            // Property: Author2 should only see their own posts
            expect(author2Result.posts.length).toBe(data.author2Posts);
            author2Result.posts.forEach(post => {
              expect(post.author_id).toBe(author2.id);
            });

            // Clean up
            await userService.deleteUser(author1.id);
            await userService.deleteUser(author2.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should filter by status while maintaining author restriction', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            draftCount: fc.integer({ min: 1, max: 3 }),
            publishedCount: fc.integer({ min: 1, max: 3 })
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

            // Create another author
            const otherAuthor = await userService.create({
              full_name: 'Other Author',
              email: `other-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create draft posts for author
            for (let i = 0; i < data.draftCount; i++) {
              await postService.create({
                title: `Draft ${i}`,
                content: 'Content',
                status: 'draft'
              }, author.id);
            }

            // Create published posts for author
            for (let i = 0; i < data.publishedCount; i++) {
              await postService.create({
                title: `Published ${i}`,
                content: 'Content',
                status: 'published'
              }, author.id);
            }

            // Create posts for other author (should not be visible)
            await postService.create({
              title: 'Other Draft',
              content: 'Content',
              status: 'draft'
            }, otherAuthor.id);

            // Get draft posts as author
            const draftResult = await postService.findAll({ status: 'draft' }, author);

            // Property: Should only see own draft posts
            expect(draftResult.posts.length).toBe(data.draftCount);
            draftResult.posts.forEach(post => {
              expect(post.author_id).toBe(author.id);
              expect(post.status).toBe('draft');
            });

            // Get published posts as author
            const publishedResult = await postService.findAll({ status: 'published' }, author);

            // Property: Should only see own published posts
            expect(publishedResult.posts.length).toBe(data.publishedCount);
            publishedResult.posts.forEach(post => {
              expect(post.author_id).toBe(author.id);
              expect(post.status).toBe('published');
            });

            // Clean up
            await userService.deleteUser(author.id);
            await userService.deleteUser(otherAuthor.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should prevent authors from accessing other authors posts by ID', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 })
          }),
          async (data) => {
            // Create two authors
            const author1 = await userService.create({
              full_name: 'Author One',
              email: `author1-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            const author2 = await userService.create({
              full_name: 'Author Two',
              email: `author2-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create post by author1
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'draft'
            }, author1.id);

            // Property: Author2 should not be able to update author1's post
            await expect(
              postService.update(post.id, { title: 'Updated' }, author2)
            ).rejects.toThrow('You can only edit your own posts');

            // Property: Author2 should not be able to delete author1's post
            await expect(
              postService.deletePost(post.id, author2)
            ).rejects.toThrow('You can only delete your own posts');

            // Clean up
            await userService.deleteUser(author1.id);
            await userService.deleteUser(author2.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);
  });

  describe('Property 25: Editors see all posts', () => {
    /**
     * For any user with editor or admin role, when viewing the post list,
     * all posts should be returned regardless of author.
     */
    test('should return all posts for editor role', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            author1Posts: fc.integer({ min: 1, max: 5 }),
            author2Posts: fc.integer({ min: 1, max: 5 })
          }),
          async (data) => {
            // Create editor
            const editor = await userService.create({
              full_name: 'Editor',
              email: `editor-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'editor',
              status: 'active'
            });

            // Create two authors
            const author1 = await userService.create({
              full_name: 'Author One',
              email: `author1-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            const author2 = await userService.create({
              full_name: 'Author Two',
              email: `author2-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create posts for author1
            for (let i = 0; i < data.author1Posts; i++) {
              await postService.create({
                title: `Author1 Post ${i}`,
                content: 'Content',
                status: 'draft'
              }, author1.id);
            }

            // Create posts for author2
            for (let i = 0; i < data.author2Posts; i++) {
              await postService.create({
                title: `Author2 Post ${i}`,
                content: 'Content',
                status: 'draft'
              }, author2.id);
            }

            // Get posts as editor
            const editorResult = await postService.findAll({}, editor);

            // Property: Editor should see all posts
            const totalPosts = data.author1Posts + data.author2Posts;
            expect(editorResult.posts.length).toBe(totalPosts);

            // Property: Posts should include both authors
            const authorIds = new Set(editorResult.posts.map(p => p.author_id));
            expect(authorIds.has(author1.id)).toBe(true);
            expect(authorIds.has(author2.id)).toBe(true);

            // Clean up
            await userService.deleteUser(editor.id);
            await userService.deleteUser(author1.id);
            await userService.deleteUser(author2.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should return all posts for admin role', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            postCount: fc.integer({ min: 2, max: 10 })
          }),
          async (data) => {
            // Create admin
            const admin = await userService.create({
              full_name: 'Admin',
              email: `admin-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'admin',
              status: 'active'
            });

            // Create multiple authors and their posts
            const authors = [];
            for (let i = 0; i < data.postCount; i++) {
              const author = await userService.create({
                full_name: `Author ${i}`,
                email: `author${i}-${Date.now()}-${Math.random()}@example.com`,
                password: 'password123',
                role: 'author',
                status: 'active'
              });
              authors.push(author);

              await postService.create({
                title: `Post ${i}`,
                content: 'Content',
                status: 'draft'
              }, author.id);
            }

            // Get posts as admin
            const adminResult = await postService.findAll({}, admin);

            // Property: Admin should see all posts
            expect(adminResult.posts.length).toBe(data.postCount);

            // Property: Each author should have one post
            const authorIds = adminResult.posts.map(p => p.author_id);
            authors.forEach(author => {
              expect(authorIds).toContain(author.id);
            });

            // Clean up
            await userService.deleteUser(admin.id);
            for (const author of authors) {
              await userService.deleteUser(author.id);
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should allow editors to update any post', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 100 }),
            newTitle: fc.string({ minLength: 5, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 })
          }),
          async (data) => {
            // Create editor
            const editor = await userService.create({
              full_name: 'Editor',
              email: `editor-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'editor',
              status: 'active'
            });

            // Create author
            const author = await userService.create({
              full_name: 'Author',
              email: `author-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create post by author
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'draft'
            }, author.id);

            // Property: Editor should be able to update author's post
            const updated = await postService.update(post.id, {
              title: data.newTitle
            }, editor);

            expect(updated.title).toBe(data.newTitle);
            expect(updated.author_id).toBe(author.id); // Author should remain unchanged

            // Clean up
            await userService.deleteUser(editor.id);
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should allow admins to delete any post', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 })
          }),
          async (data) => {
            // Create admin
            const admin = await userService.create({
              full_name: 'Admin',
              email: `admin-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'admin',
              status: 'active'
            });

            // Create author
            const author = await userService.create({
              full_name: 'Author',
              email: `author-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create post by author
            const post = await postService.create({
              title: data.title,
              content: data.content,
              status: 'draft'
            }, author.id);

            // Property: Admin should be able to delete author's post
            await postService.deletePost(post.id, admin);

            // Property: Post should no longer exist
            await expect(
              postService.findById(post.id)
            ).rejects.toThrow('Post not found');

            // Clean up
            await userService.deleteUser(admin.id);
            await userService.deleteUser(author.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);

    test('should allow editors to filter posts by specific author', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            author1Posts: fc.integer({ min: 1, max: 3 }),
            author2Posts: fc.integer({ min: 1, max: 3 })
          }),
          async (data) => {
            // Create editor
            const editor = await userService.create({
              full_name: 'Editor',
              email: `editor-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'editor',
              status: 'active'
            });

            // Create two authors
            const author1 = await userService.create({
              full_name: 'Author One',
              email: `author1-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            const author2 = await userService.create({
              full_name: 'Author Two',
              email: `author2-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              role: 'author',
              status: 'active'
            });

            // Create posts
            for (let i = 0; i < data.author1Posts; i++) {
              await postService.create({
                title: `Author1 Post ${i}`,
                content: 'Content',
                status: 'draft'
              }, author1.id);
            }

            for (let i = 0; i < data.author2Posts; i++) {
              await postService.create({
                title: `Author2 Post ${i}`,
                content: 'Content',
                status: 'draft'
              }, author2.id);
            }

            // Property: Editor can filter by author1
            const author1Result = await postService.findAll({ authorId: author1.id }, editor);
            expect(author1Result.posts.length).toBe(data.author1Posts);
            author1Result.posts.forEach(post => {
              expect(post.author_id).toBe(author1.id);
            });

            // Property: Editor can filter by author2
            const author2Result = await postService.findAll({ authorId: author2.id }, editor);
            expect(author2Result.posts.length).toBe(data.author2Posts);
            author2Result.posts.forEach(post => {
              expect(post.author_id).toBe(author2.id);
            });

            // Clean up
            await userService.deleteUser(editor.id);
            await userService.deleteUser(author1.id);
            await userService.deleteUser(author2.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 120000);
  });
});
