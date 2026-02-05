import sequelize from '../config/database';
import User from './User';
import Message from './Message';
import Bien from './Bien';
import Estimation from './Estimation';
import Comparable from './Comparable';
import Lead from './Lead';
import ScrapingJob from './ScrapingJob';

// Définir les associations existantes
User.hasMany(Message, { foreignKey: 'user_id', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Estimation, { foreignKey: 'user_id', as: 'estimations' });
Estimation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Bien.hasMany(Estimation, { foreignKey: 'bien_id', as: 'estimations' });
Estimation.belongsTo(Bien, { foreignKey: 'bien_id', as: 'bien' });

Estimation.hasMany(Lead, { foreignKey: 'estimation_id', as: 'leads' });
Lead.belongsTo(Estimation, { foreignKey: 'estimation_id', as: 'estimation' });

// Synchroniser les modèles avec la base de données
export const syncDatabase = async (): Promise<void> => {
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

export {
  sequelize,
  User,
  Message,
  Bien,
  Estimation,
  Comparable,
  Lead,
  ScrapingJob
};
