const sequelize = require('../config/database');
const User = require('./User');
const Message = require('./Message');

// Définir les associations
User.hasMany(Message, { foreignKey: 'user_id', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Synchroniser les modèles avec la base de données
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modèles synchronisés avec la base de données');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Message,
  syncDatabase
};