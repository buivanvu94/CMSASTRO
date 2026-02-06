/**
 * User Model Associations
 * Define relationships between User and other models
 */

/**
 * Setup User model associations
 * @param {Object} models - Object containing all models
 */
export const setupUserAssociations = (models) => {
  const { User, Media } = models;

  // User belongs to Media (avatar)
  if (Media) {
    User.belongsTo(Media, {
      as: 'avatar',
      foreignKey: 'avatar_id',
      onDelete: 'SET NULL'
    });
  }
};

export default setupUserAssociations;
