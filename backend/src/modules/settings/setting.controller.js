import * as settingService from './setting.service.js';
import { successResponse } from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

/**
 * Setting Controller
 * Handles HTTP requests for settings management
 */

/**
 * Get all settings
 * GET /settings
 */
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingService.findAll();

  return successResponse(res, settings, 'Settings retrieved successfully');
});

/**
 * Get setting by key
 * GET /settings/:key
 */
export const getSettingByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const setting = await settingService.findByKey(key);

  return successResponse(res, setting, 'Setting retrieved successfully');
});

/**
 * Get settings by group
 * GET /settings/group/:group
 */
export const getSettingsByGroup = asyncHandler(async (req, res) => {
  const { group } = req.params;
  const settings = await settingService.findByGroup(group);

  return successResponse(res, settings, 'Settings retrieved successfully');
});

/**
 * Update settings (upsert multiple)
 * PUT /settings
 */
export const updateSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  const results = await settingService.updateMultiple(settings);

  return successResponse(res, results, 'Settings updated successfully');
});

/**
 * Get settings as key-value object
 * GET /settings/object
 */
export const getSettingsAsObject = asyncHandler(async (req, res) => {
  const { group } = req.query;
  const settings = await settingService.getAsObject(group);

  return successResponse(res, settings, 'Settings retrieved successfully');
});

export default {
  getSettings,
  getSettingByKey,
  getSettingsByGroup,
  updateSettings,
  getSettingsAsObject
};
