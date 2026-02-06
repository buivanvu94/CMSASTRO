/**
 * Media Model Associations
 * Define relationships between Media and other models
 */

/**
 * Setup Media model associations
 * @param {Object} models - Object containing all models
 */
export const setupMediaAssociations = (models) => {
  const { Media, User } = models;

  // Media belongs to User (uploader)
  if (User) {
    Media.belongsTo(User, {
      as: 'uploader',
      foreignKey: 'uploaded_by',
      onDelete: 'SET NULL'
    });
  }
};

export default setupMediaAssociations;
