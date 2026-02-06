import { Op } from 'sequelize';
import Contact from './contact.model.js';
import { NotFoundError, ValidationError } from '../../middlewares/errorHandler.js';

/**
 * Contact Service
 * Business logic for contact form management
 */

/**
 * Find all contacts with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Contacts and pagination info
 */
export const findAll = async ({
  page = 1,
  limit = 20,
  search = '',
  status = null,
  dateFrom = null,
  dateTo = null
} = {}) => {
  const offset = (page - 1) * limit;

  // Build where clause
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { subject: { [Op.like]: `%${search}%` } },
      { message: { [Op.like]: `%${search}%` } }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.created_at = {};
    if (dateFrom) {
      where.created_at[Op.gte] = dateFrom;
    }
    if (dateTo) {
      where.created_at[Op.lte] = dateTo;
    }
  }

  const { count, rows } = await Contact.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return {
    contacts: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Find contact by ID
 * @param {number} id - Contact ID
 * @returns {Promise<Object>} - Contact object
 * @throws {NotFoundError} - If contact not found
 */
export const findById = async (id) => {
  const contact = await Contact.findByPk(id);

  if (!contact) {
    throw new NotFoundError('Contact not found');
  }

  return contact;
};

/**
 * Create new contact (public - no auth required)
 * @param {Object} data - Contact data
 * @param {string} ipAddress - IP address of submitter
 * @param {string} userAgent - Browser user agent
 * @returns {Promise<Object>} - Created contact
 */
export const create = async (data, ipAddress = null, userAgent = null) => {
  // Validate required fields
  if (!data.name || !data.email || !data.subject || !data.message) {
    throw new ValidationError('Name, email, subject, and message are required');
  }

  // Create contact with new status
  const contact = await Contact.create({
    ...data,
    status: 'new',
    ip_address: ipAddress,
    user_agent: userAgent
  });

  return contact;
};

/**
 * Update contact status
 * @param {number} id - Contact ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated contact
 */
export const updateStatus = async (id, status) => {
  const contact = await findById(id);

  // Validate status
  const validStatuses = ['new', 'read', 'replied', 'spam'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  await contact.update({ status });
  return contact;
};

/**
 * Delete contact
 * @param {number} id - Contact ID
 * @returns {Promise<void>}
 */
export const deleteContact = async (id) => {
  const contact = await findById(id);
  await contact.destroy();
};

/**
 * Delete multiple contacts
 * @param {Array<number>} ids - Array of contact IDs
 * @returns {Promise<number>} - Number of deleted contacts
 */
export const deleteMultiple = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ValidationError('IDs must be a non-empty array');
  }

  const deletedCount = await Contact.destroy({
    where: {
      id: {
        [Op.in]: ids
      }
    }
  });

  return deletedCount;
};

/**
 * Get contact statistics
 * @returns {Promise<Object>} - Statistics
 */
export const getStats = async () => {
  const total = await Contact.count();

  const byStatus = await Contact.findAll({
    attributes: [
      'status',
      [Contact.sequelize.fn('COUNT', Contact.sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  const newContacts = await Contact.count({ where: { status: 'new' } });
  const unreadContacts = await Contact.count({
    where: {
      status: {
        [Op.in]: ['new', 'read']
      }
    }
  });

  // Get contacts from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentContacts = await Contact.count({
    where: {
      created_at: {
        [Op.gte]: sevenDaysAgo
      }
    }
  });

  return {
    total,
    byStatus: byStatus.map(s => ({
      status: s.status,
      count: parseInt(s.get('count'))
    })),
    newContacts,
    unreadContacts,
    recentContacts
  };
};

export default {
  findAll,
  findById,
  create,
  updateStatus,
  deleteContact,
  deleteMultiple,
  getStats
};
