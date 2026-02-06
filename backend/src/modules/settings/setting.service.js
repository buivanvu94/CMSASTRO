import Setting from './setting.model.js';
import { NotFoundError } from '../../middlewares/errorHandler.js';

/**
 * Setting Service
 * Business logic for settings management
 */

/**
 * Find all settings
 * @returns {Promise<Array>} - Array of settings with parsed values
 */
export const findAll = async () => {
  const settings = await Setting.findAll({
    order: [['group', 'ASC'], ['key', 'ASC']]
  });

  // Return settings with parsed values
  return settings.map(setting => ({
    ...setting.toJSON(),
    parsedValue: setting.getParsedValue()
  }));
};

/**
 * Find setting by key
 * @param {string} key - Setting key
 * @returns {Promise<Object>} - Setting object with parsed value
 * @throws {NotFoundError} - If setting not found
 */
export const findByKey = async (key) => {
  const setting = await Setting.findOne({ where: { key } });

  if (!setting) {
    throw new NotFoundError(`Setting not found: ${key}`);
  }

  return {
    ...setting.toJSON(),
    parsedValue: setting.getParsedValue()
  };
};

/**
 * Find settings by group
 * @param {string} group - Setting group
 * @returns {Promise<Array>} - Array of settings with parsed values
 */
export const findByGroup = async (group) => {
  const settings = await Setting.findAll({
    where: { group },
    order: [['key', 'ASC']]
  });

  return settings.map(setting => ({
    ...setting.toJSON(),
    parsedValue: setting.getParsedValue()
  }));
};

/**
 * Update or create setting (upsert)
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 * @param {Object} options - Additional options (group, type, description)
 * @returns {Promise<Object>} - Updated/created setting
 */
export const upsert = async (key, value, options = {}) => {
  const { group = 'general', type = 'string', description = null } = options;

  // Find existing setting
  let setting = await Setting.findOne({ where: { key } });

  if (setting) {
    // Update existing setting
    await setting.setValue(value);
    
    // Update other fields if provided
    if (options.group) setting.group = group;
    if (options.type) setting.type = type;
    if (options.description !== undefined) setting.description = description;
    
    await setting.save();
  } else {
    // Create new setting
    let stringValue;
    switch (type) {
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      case 'boolean':
        stringValue = value ? 'true' : 'false';
        break;
      case 'number':
        stringValue = String(value);
        break;
      case 'string':
      default:
        stringValue = String(value);
    }

    setting = await Setting.create({
      key,
      value: stringValue,
      group,
      type,
      description
    });
  }

  return {
    ...setting.toJSON(),
    parsedValue: setting.getParsedValue()
  };
};

/**
 * Update multiple settings at once
 * @param {Array} settings - Array of {key, value, group?, type?, description?}
 * @returns {Promise<Array>} - Array of updated settings
 */
export const updateMultiple = async (settings) => {
  const results = [];

  for (const settingData of settings) {
    const { key, value, ...options } = settingData;
    const result = await upsert(key, value, options);
    results.push(result);
  }

  return results;
};

/**
 * Delete setting
 * @param {string} key - Setting key
 * @returns {Promise<void>}
 */
export const deleteSetting = async (key) => {
  const setting = await Setting.findOne({ where: { key } });

  if (!setting) {
    throw new NotFoundError(`Setting not found: ${key}`);
  }

  await setting.destroy();
};

/**
 * Get settings as key-value object
 * @param {string} group - Optional group filter
 * @returns {Promise<Object>} - Settings as key-value pairs
 */
export const getAsObject = async (group = null) => {
  const where = group ? { group } : {};
  const settings = await Setting.findAll({ where });

  const result = {};
  settings.forEach(setting => {
    result[setting.key] = setting.getParsedValue();
  });

  return result;
};

export default {
  findAll,
  findByKey,
  findByGroup,
  upsert,
  updateMultiple,
  deleteSetting,
  getAsObject
};
