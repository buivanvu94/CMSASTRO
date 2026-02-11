import express from 'express';
import * as settingController from './setting.controller.js';
import * as settingValidation from './setting.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';

const router = express.Router();

/**
 * Setting Routes
 * All routes require authentication (admin only)
 */

/**
 * GET /settings/object
 * Get settings as key-value object
 */
router.get(
  '/object',
  authenticate,
  authorize(['admin']),
  settingValidation.getSettingsAsObjectValidation,
  settingValidation.handleValidationErrors,
  settingController.getSettingsAsObject
);

/**
 * GET /settings/group/:group
 * Get settings by group
 */
router.get(
  '/booking-email',
  authenticate,
  authorize(['admin']),
  settingController.getBookingEmailConfig
);

router.put(
  '/booking-email',
  authenticate,
  authorize(['admin']),
  settingValidation.updateBookingEmailConfigValidation,
  settingValidation.handleValidationErrors,
  settingController.updateBookingEmailConfig
);

router.post(
  '/booking-email/test',
  authenticate,
  authorize(['admin']),
  settingValidation.testBookingSmtpValidation,
  settingValidation.handleValidationErrors,
  settingController.testBookingEmailConfig
);

router.get(
  '/group/:group',
  authenticate,
  authorize(['admin']),
  settingValidation.getSettingsByGroupValidation,
  settingValidation.handleValidationErrors,
  settingController.getSettingsByGroup
);

/**
 * GET /settings
 * Get all settings
 */
router.get(
  '/',
  authenticate,
  authorize(['admin']),
  settingController.getSettings
);

/**
 * GET /settings/:key
 * Get setting by key
 */
router.get(
  '/:key',
  authenticate,
  authorize(['admin']),
  settingValidation.getSettingByKeyValidation,
  settingValidation.handleValidationErrors,
  settingController.getSettingByKey
);

/**
 * PUT /settings
 * Update settings (upsert multiple)
 */
router.put(
  '/',
  authenticate,
  authorize(['admin']),
  settingValidation.updateSettingsValidation,
  settingValidation.handleValidationErrors,
  settingController.updateSettings
);

export default router;
