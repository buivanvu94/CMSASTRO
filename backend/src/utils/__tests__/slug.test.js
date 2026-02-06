import { jest } from '@jest/globals';
import {
  removeVietnameseTones,
  slugify,
  generateUniqueSlug,
  generateSlugFromTitle
} from '../slug.js';

describe('Slug Utility', () => {
  describe('removeVietnameseTones', () => {
    it('should convert Vietnamese lowercase characters to ASCII', () => {
      expect(removeVietnameseTones('à')).toBe('a');
      expect(removeVietnameseTones('á')).toBe('a');
      expect(removeVietnameseTones('ạ')).toBe('a');
      expect(removeVietnameseTones('ả')).toBe('a');
      expect(removeVietnameseTones('ã')).toBe('a');
      expect(removeVietnameseTones('â')).toBe('a');
      expect(removeVietnameseTones('ầ')).toBe('a');
      expect(removeVietnameseTones('ấ')).toBe('a');
      expect(removeVietnameseTones('ậ')).toBe('a');
      expect(removeVietnameseTones('ẩ')).toBe('a');
      expect(removeVietnameseTones('ẫ')).toBe('a');
      expect(removeVietnameseTones('ă')).toBe('a');
      expect(removeVietnameseTones('ằ')).toBe('a');
      expect(removeVietnameseTones('ắ')).toBe('a');
      expect(removeVietnameseTones('ặ')).toBe('a');
      expect(removeVietnameseTones('ẳ')).toBe('a');
      expect(removeVietnameseTones('ẵ')).toBe('a');
    });

    it('should convert Vietnamese uppercase characters to ASCII', () => {
      expect(removeVietnameseTones('À')).toBe('A');
      expect(removeVietnameseTones('Á')).toBe('A');
      expect(removeVietnameseTones('Ạ')).toBe('A');
      expect(removeVietnameseTones('Ả')).toBe('A');
      expect(removeVietnameseTones('Ã')).toBe('A');
    });

    it('should convert đ and Đ', () => {
      expect(removeVietnameseTones('đ')).toBe('d');
      expect(removeVietnameseTones('Đ')).toBe('D');
    });

    it('should convert Vietnamese words', () => {
      expect(removeVietnameseTones('Tiếng Việt')).toBe('Tieng Viet');
      expect(removeVietnameseTones('Hà Nội')).toBe('Ha Noi');
      expect(removeVietnameseTones('Sài Gòn')).toBe('Sai Gon');
      expect(removeVietnameseTones('Đà Nẵng')).toBe('Da Nang');
    });

    it('should handle empty string', () => {
      expect(removeVietnameseTones('')).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(removeVietnameseTones(null)).toBe('');
      expect(removeVietnameseTones(undefined)).toBe('');
    });

    it('should preserve non-Vietnamese characters', () => {
      expect(removeVietnameseTones('Hello World')).toBe('Hello World');
      expect(removeVietnameseTones('123')).toBe('123');
    });
  });

  describe('slugify', () => {
    it('should convert string to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('UPPERCASE')).toBe('uppercase');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world');
      expect(slugify('multiple   spaces')).toBe('multiple-spaces');
    });

    it('should remove special characters', () => {
      expect(slugify('hello@world!')).toBe('helloworld');
      expect(slugify('test#123$')).toBe('test123');
      expect(slugify('hello & world')).toBe('hello-world');
    });

    it('should convert Vietnamese characters', () => {
      expect(slugify('Tiếng Việt')).toBe('tieng-viet');
      expect(slugify('Hà Nội')).toBe('ha-noi');
      expect(slugify('Sài Gòn')).toBe('sai-gon');
      expect(slugify('Đà Nẵng')).toBe('da-nang');
    });

    it('should handle multiple hyphens', () => {
      expect(slugify('hello---world')).toBe('hello-world');
      expect(slugify('test--123')).toBe('test-123');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(slugify('-hello-')).toBe('hello');
      expect(slugify('--test--')).toBe('test');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
    });

    it('should handle complex Vietnamese titles', () => {
      expect(slugify('Bài viết về lập trình')).toBe('bai-viet-ve-lap-trinh');
      expect(slugify('Hướng dẫn sử dụng Node.js')).toBe('huong-dan-su-dung-nodejs');
    });
  });

  describe('generateUniqueSlug', () => {
    it('should return base slug if it does not exist', async () => {
      const checkExists = jest.fn().mockResolvedValue(false);
      const slug = await generateUniqueSlug('test-slug', checkExists);
      
      expect(slug).toBe('test-slug');
      expect(checkExists).toHaveBeenCalledWith('test-slug', null);
    });

    it('should append number if slug exists', async () => {
      const checkExists = jest.fn()
        .mockResolvedValueOnce(true)  // test-slug exists
        .mockResolvedValueOnce(false); // test-slug-1 does not exist
      
      const slug = await generateUniqueSlug('test-slug', checkExists);
      
      expect(slug).toBe('test-slug-1');
      expect(checkExists).toHaveBeenCalledTimes(2);
    });

    it('should increment number until unique slug found', async () => {
      const checkExists = jest.fn()
        .mockResolvedValueOnce(true)  // test-slug exists
        .mockResolvedValueOnce(true)  // test-slug-1 exists
        .mockResolvedValueOnce(true)  // test-slug-2 exists
        .mockResolvedValueOnce(false); // test-slug-3 does not exist
      
      const slug = await generateUniqueSlug('test-slug', checkExists);
      
      expect(slug).toBe('test-slug-3');
      expect(checkExists).toHaveBeenCalledTimes(4);
    });

    it('should pass excludeId to checkExists', async () => {
      const checkExists = jest.fn().mockResolvedValue(false);
      const slug = await generateUniqueSlug('test-slug', checkExists, 5);
      
      expect(slug).toBe('test-slug');
      expect(checkExists).toHaveBeenCalledWith('test-slug', 5);
    });
  });

  describe('generateSlugFromTitle', () => {
    it('should generate slug from title', async () => {
      const checkExists = jest.fn().mockResolvedValue(false);
      const slug = await generateSlugFromTitle('Hello World', checkExists);
      
      expect(slug).toBe('hello-world');
    });

    it('should generate unique slug from Vietnamese title', async () => {
      const checkExists = jest.fn().mockResolvedValue(false);
      const slug = await generateSlugFromTitle('Bài viết về lập trình', checkExists);
      
      expect(slug).toBe('bai-viet-ve-lap-trinh');
    });

    it('should append number if slug from title exists', async () => {
      const checkExists = jest.fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      
      const slug = await generateSlugFromTitle('Hello World', checkExists);
      
      expect(slug).toBe('hello-world-1');
    });
  });
});
