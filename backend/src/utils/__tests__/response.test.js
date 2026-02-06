import { jest } from '@jest/globals';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse
} from '../response.js';

describe('Response Utility', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('successResponse', () => {
    it('should return success response with data', () => {
      const data = { id: 1, name: 'Test' };
      successResponse(res, data, 'Success');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data
      });
    });

    it('should return success response without data', () => {
      successResponse(res, null, 'Success');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success'
      });
    });

    it('should use custom status code', () => {
      successResponse(res, { test: true }, 'Success', 201);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should use default message', () => {
      successResponse(res, { test: true });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Success'
        })
      );
    });
  });

  describe('createdResponse', () => {
    it('should return 201 status with data', () => {
      const data = { id: 1, name: 'New Resource' };
      createdResponse(res, data);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Resource created successfully',
        data
      });
    });

    it('should use custom message', () => {
      const data = { id: 1 };
      createdResponse(res, data, 'Custom created message');

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Custom created message'
        })
      );
    });
  });

  describe('paginatedResponse', () => {
    it('should return paginated response with correct metadata', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const total = 25;
      const page = 2;
      const limit = 10;

      paginatedResponse(res, items, total, page, limit);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: items,
        pagination: {
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: true
        }
      });
    });

    it('should calculate hasNextPage correctly', () => {
      const items = [{ id: 1 }];
      paginatedResponse(res, items, 10, 1, 10);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            hasNextPage: false,
            hasPrevPage: false
          })
        })
      );
    });

    it('should calculate hasPrevPage correctly', () => {
      const items = [{ id: 1 }];
      paginatedResponse(res, items, 30, 3, 10);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            hasNextPage: false,
            hasPrevPage: true
          })
        })
      );
    });

    it('should calculate totalPages correctly', () => {
      paginatedResponse(res, [], 25, 1, 10);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            totalPages: 3
          })
        })
      );
    });

    it('should handle custom message', () => {
      paginatedResponse(res, [], 0, 1, 10, 'Custom message');

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Custom message'
        })
      );
    });
  });

  describe('noContentResponse', () => {
    it('should return 204 status with no content', () => {
      noContentResponse(res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
