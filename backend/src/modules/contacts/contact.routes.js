import express from 'express';
import * as contactController from './contact.controller.js';
import * as contactValidation from './contact.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';

const router = express.Router();

/**
 * Contact Routes
 * Some routes are public (create), others require authentication
 */

/**
 * GET /contacts/stats
 * Get contact statistics
 * Requires authentication (admin/editor)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin', 'editor']),
  contactController.getStats
);

/**
 * DELETE /contacts/bulk
 * Bulk delete contacts
 * Requires authentication (admin/editor)
 */
router.delete(
  '/bulk',
  authenticate,
  authorize(['admin', 'editor']),
  contactValidation.bulkDeleteContactsValidation,
  contactValidation.handleValidationErrors,
  contactController.bulkDeleteContacts
);

/**
 * GET /contacts
 * List all contacts
 * Requires authentication (admin/editor)
 */
router.get(
  '/',
  authenticate,
  authorize(['admin', 'editor']),
  contactValidation.getContactsValidation,
  contactValidation.handleValidationErrors,
  contactController.getContacts
);

/**
 * GET /contacts/:id
 * Get contact by ID
 * Requires authentication (admin/editor)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  contactValidation.getContactByIdValidation,
  contactValidation.handleValidationErrors,
  contactController.getContactById
);

/**
 * POST /contacts
 * Create new contact
 * PUBLIC ENDPOINT - No authentication required
 */
router.post(
  '/',
  contactValidation.createContactValidation,
  contactValidation.handleValidationErrors,
  contactController.createContact
);

/**
 * PUT /contacts/:id/status
 * Update contact status
 * Requires authentication (admin/editor)
 */
router.put(
  '/:id/status',
  authenticate,
  authorize(['admin', 'editor']),
  contactValidation.updateContactStatusValidation,
  contactValidation.handleValidationErrors,
  contactController.updateContactStatus
);

/**
 * DELETE /contacts/:id
 * Delete contact
 * Requires authentication (admin/editor)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin', 'editor']),
  contactValidation.deleteContactValidation,
  contactValidation.handleValidationErrors,
  contactController.deleteContact
);

export default router;
