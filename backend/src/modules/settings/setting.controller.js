import * as settingService from './setting.service.js';
import { successResponse } from '../../utils/response.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';
import { sendMail, verifyMailConnection } from '../../utils/mailer.js';

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

export const getBookingEmailConfig = asyncHandler(async (req, res) => {
  const config = await settingService.getBookingEmailConfig();
  return successResponse(res, config, 'Booking email settings retrieved successfully');
});

export const updateBookingEmailConfig = asyncHandler(async (req, res) => {
  const config = await settingService.updateBookingEmailConfig(req.body || {});
  return successResponse(res, config, 'Booking email settings updated successfully');
});

export const testBookingEmailConfig = asyncHandler(async (req, res) => {
  const { testTo } = req.body;
  const runtimeConfig = await settingService.getBookingEmailRuntimeConfig();

  const verifyResult = await verifyMailConnection(runtimeConfig);
  if (!verifyResult.ok) {
    return successResponse(
      res,
      { sent: false, reason: verifyResult.reason, detail: verifyResult.message || null },
      'SMTP test failed'
    );
  }

  const nowText = new Date().toLocaleString('vi-VN');
  const result = await sendMail({
    to: testTo,
    subject: '[Aurelian Seafood] SMTP test email',
    text: `Ket noi SMTP thanh cong. Email test duoc gui luc ${nowText}.`,
    html: `<p>Ket noi SMTP thanh cong.</p><p>Email test duoc gui luc <strong>${nowText}</strong>.</p>`,
    overrideConfig: runtimeConfig
  });

  return successResponse(
    res,
    result,
    result.sent ? 'SMTP test email sent successfully' : 'SMTP test email failed'
  );
});

export default {
  getSettings,
  getSettingByKey,
  getSettingsByGroup,
  updateSettings,
  getSettingsAsObject,
  getBookingEmailConfig,
  updateBookingEmailConfig,
  testBookingEmailConfig
};
