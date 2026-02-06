import * as contactService from './contact.service.js';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse
} from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

/**
 * Contact Controller
 * Handles HTTP requests for contact form management
 */

/**
 * Get all contacts
 * GET /contacts
 */
export const getContacts = asyncHandler(async (req, res) => {
  const { page, limit, search, status, dateFrom, dateTo } = req.query;

  const result = await contactService.findAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    search,
    status,
    dateFrom,
    dateTo
  });

  return paginatedResponse(
    res,
    result.contacts,
    result.total,
    result.page,
    result.limit,
    'Contacts retrieved successfully'
  );
});

/**
 * Get contact by ID
 * GET /contacts/:id
 */
export const getContactById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contact = await contactService.findById(parseInt(id));

  return successResponse(res, contact, 'Contact retrieved successfully');
});

/**
 * Create new contact (public endpoint - no auth required)
 * POST /contacts
 */
export const createContact = asyncHandler(async (req, res) => {
  const data = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');

  const contact = await contactService.create(data, ipAddress, userAgent);

  return createdResponse(res, contact, 'Contact submitted successfully');
});

/**
 * Update contact status
 * PUT /contacts/:id/status
 */
export const updateContactStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const contact = await contactService.updateStatus(parseInt(id), status);

  return successResponse(res, contact, 'Contact status updated successfully');
});

/**
 * Delete contact
 * DELETE /contacts/:id
 */
export const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await contactService.deleteContact(parseInt(id));

  return noContentResponse(res);
});

/**
 * Bulk delete contacts
 * DELETE /contacts/bulk
 */
export const bulkDeleteContacts = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const deletedCount = await contactService.deleteMultiple(ids);

  return successResponse(
    res,
    { deletedCount },
    `${deletedCount} contact(s) deleted successfully`
  );
});

/**
 * Get contact statistics
 * GET /contacts/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await contactService.getStats();

  return successResponse(res, stats, 'Statistics retrieved successfully');
});

export default {
  getContacts,
  getContactById,
  createContact,
  updateContactStatus,
  deleteContact,
  bulkDeleteContacts,
  getStats
};
