import { jest } from '@jest/globals';
import fc from 'fast-check';
import { removeVietnameseTones, slugify } from '../slug.js';

/**
 * Feature: cms-system, Property 12: Category slug generation
 * Validates: Requirements 3.1, 19.1, 19.2, 19.3
 * 
 * Property: For any category name including Vietnamese characters, when creating a category,
 * the system should generate a URL-friendly slug with ASCII characters, hyphens instead of 
 * spaces, and no special characters.
 */

describe('Slug Generation Property-Based Tests', () => {
  // Configure fast-check to run 100 iterations minimum
  const fcConfig = { numRuns: 100 };

  describe('Property 12: Category slug generation', () => {
    describe('Vietnamese character conversion', () => {
      it('should convert all Vietnamese characters to ASCII', () => {
        // Generator for Vietnamese characters
        const vietnameseChars = fc.constantFrom(
          'à', 'á', 'ạ', 'ả', 'ã', 'â', 'ầ', 'ấ', 'ậ', 'ẩ', 'ẫ',
          'ă', 'ằ', 'ắ', 'ặ', 'ẳ', 'ẵ',
          'è', 'é', 'ẹ', 'ẻ', 'ẽ', 'ê', 'ề', 'ế', 'ệ', 'ể', 'ễ',
          'ì', 'í', 'ị', 'ỉ', 'ĩ',
          'ò', 'ó', 'ọ', 'ỏ', 'õ', 'ô', 'ồ', 'ố', 'ộ', 'ổ', 'ỗ',
          'ơ', 'ờ', 'ớ', 'ợ', 'ở', 'ỡ',
          'ù', 'ú', 'ụ', 'ủ', 'ũ', 'ư', 'ừ', 'ứ', 'ự', 'ử', 'ữ',
          'ỳ', 'ý', 'ỵ', 'ỷ', 'ỹ', 'đ',
          'À', 'Á', 'Ạ', 'Ả', 'Ã', 'Â', 'Ầ', 'Ấ', 'Ậ', 'Ẩ', 'Ẫ',
          'Ă', 'Ằ', 'Ắ', 'Ặ', 'Ẳ', 'Ẵ',
          'È', 'É', 'Ẹ', 'Ẻ', 'Ẽ', 'Ê', 'Ề', 'Ế', 'Ệ', 'Ể', 'Ễ',
          'Ì', 'Í', 'Ị', 'Ỉ', 'Ĩ',
          'Ò', 'Ó', 'Ọ', 'Ỏ', 'Õ', 'Ô', 'Ồ', 'Ố', 'Ộ', 'Ổ', 'Ỗ',
          'Ơ', 'Ờ', 'Ớ', 'Ợ', 'Ở', 'Ỡ',
          'Ù', 'Ú', 'Ụ', 'Ủ', 'Ũ', 'Ư', 'Ừ', 'Ứ', 'Ự', 'Ử', 'Ữ',
          'Ỳ', 'Ý', 'Ỵ', 'Ỷ', 'Ỹ', 'Đ'
        );

        fc.assert(
          fc.property(
            fc.array(vietnameseChars, { minLength: 1, maxLength: 20 }),
            (chars) => {
              const input = chars.join('');
              const result = removeVietnameseTones(input);
              
              // Result should only contain ASCII characters
              const asciiRegex = /^[a-zA-Z]*$/;
              return asciiRegex.test(result);
            }
          ),
          fcConfig
        );
      });

      it('should preserve non-Vietnamese characters', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }).filter(s => {
              // Only ASCII alphanumeric and spaces
              return /^[a-zA-Z0-9 ]+$/.test(s);
            }),
            (input) => {
              const result = removeVietnameseTones(input);
              return result === input;
            }
          ),
          fcConfig
        );
      });
    });

    describe('Slug format validation', () => {
      it('should generate URL-friendly slugs with only lowercase, numbers, and hyphens', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 100 }),
            (input) => {
              const slug = slugify(input);
              
              // If input produces empty slug, that's valid
              if (slug === '') return true;
              
              // Slug should only contain lowercase letters, numbers, and hyphens
              const validSlugRegex = /^[a-z0-9-]+$/;
              return validSlugRegex.test(slug);
            }
          ),
          fcConfig
        );
      });

      it('should replace spaces with hyphens', () => {
        fc.assert(
          fc.property(
            fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 5 }),
            (words) => {
              const input = words.join(' ');
              const slug = slugify(input);
              
              // Slug should not contain spaces
              return !slug.includes(' ');
            }
          ),
          fcConfig
        );
      });

      it('should remove special characters', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }),
            (input) => {
              const slug = slugify(input);
              
              // Slug should not contain special characters
              const specialCharsRegex = /[^a-z0-9-]/;
              return !specialCharsRegex.test(slug);
            }
          ),
          fcConfig
        );
      });

      it('should not have leading or trailing hyphens', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }),
            (input) => {
              const slug = slugify(input);
              
              // If slug is empty, that's valid
              if (slug === '') return true;
              
              // Slug should not start or end with hyphen
              return !slug.startsWith('-') && !slug.endsWith('-');
            }
          ),
          fcConfig
        );
      });

      it('should not have consecutive hyphens', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }),
            (input) => {
              const slug = slugify(input);
              
              // Slug should not contain consecutive hyphens
              return !slug.includes('--');
            }
          ),
          fcConfig
        );
      });
    });

    describe('Vietnamese text slug generation', () => {
      it('should generate valid slugs from Vietnamese text', () => {
        // Generator for Vietnamese words
        const vietnameseWords = fc.constantFrom(
          'Tiếng', 'Việt', 'Hà', 'Nội', 'Sài', 'Gòn', 'Đà', 'Nẵng',
          'Bài', 'viết', 'Lập', 'trình', 'Hướng', 'dẫn', 'Công', 'nghệ',
          'Phát', 'triển', 'Ứng', 'dụng', 'Hệ', 'thống', 'Quản', 'lý'
        );

        fc.assert(
          fc.property(
            fc.array(vietnameseWords, { minLength: 1, maxLength: 5 }),
            (words) => {
              const input = words.join(' ');
              const slug = slugify(input);
              
              // Slug should be valid
              const validSlugRegex = /^[a-z0-9-]+$/;
              return slug === '' || validSlugRegex.test(slug);
            }
          ),
          fcConfig
        );
      });

      it('should convert Vietnamese text to ASCII-only slugs', () => {
        const vietnameseWords = fc.constantFrom(
          'Tiếng Việt', 'Hà Nội', 'Sài Gòn', 'Đà Nẵng',
          'Bài viết về lập trình', 'Hướng dẫn sử dụng',
          'Công nghệ thông tin', 'Phát triển ứng dụng'
        );

        fc.assert(
          fc.property(
            vietnameseWords,
            (input) => {
              const slug = slugify(input);
              
              // Slug should not contain Vietnamese characters
              const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
              return !vietnameseRegex.test(slug);
            }
          ),
          fcConfig
        );
      });
    });

    describe('Idempotence', () => {
      it('should produce same result when slugified twice', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }),
            (input) => {
              const slug1 = slugify(input);
              const slug2 = slugify(slug1);
              
              return slug1 === slug2;
            }
          ),
          fcConfig
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle empty strings', () => {
        expect(slugify('')).toBe('');
      });

      it('should handle strings with only special characters', () => {
        fc.assert(
          fc.property(
            fc.string().filter(s => /^[^a-zA-Z0-9]+$/.test(s) && s.length > 0),
            (input) => {
              const slug = slugify(input);
              return slug === '';
            }
          ),
          fcConfig
        );
      });

      it('should handle very long strings', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 100, maxLength: 500 }),
            (input) => {
              const slug = slugify(input);
              
              // Should produce valid slug regardless of length
              return slug === '' || /^[a-z0-9-]+$/.test(slug);
            }
          ),
          fcConfig
        );
      });
    });

    describe('Consistency', () => {
      it('should produce consistent results for same input', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }),
            (input) => {
              const slug1 = slugify(input);
              const slug2 = slugify(input);
              const slug3 = slugify(input);
              
              return slug1 === slug2 && slug2 === slug3;
            }
          ),
          fcConfig
        );
      });
    });
  });
});
