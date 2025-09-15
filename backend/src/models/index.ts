import sequelize from '../config/database';
import User from './User';
import Message from './Message';
import Societe from './Societe';
import ActifImmobilier from './ActifImmobilier';
import Locataire from './Locataire';
import Loyer from './Loyer';
import Valorisation from './Valorisation';
import Financement from './Financement';
import CalculActifImmobilier from './CalculActifImmobilier';
import CalculLoyer from './CalculLoyer';
import CalculFinancement from './CalculFinancement';

// Définir les associations existantes
User.hasMany(Message, { foreignKey: 'user_id', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Définir les nouvelles associations
// Societe -> ActifImmobilier (One-to-Many)
Societe.hasMany(ActifImmobilier, { foreignKey: 'societe_id', as: 'actifs_immobiliers' });
ActifImmobilier.belongsTo(Societe, { foreignKey: 'societe_id', as: 'societe' });

// ActifImmobilier -> Loyer (One-to-Many)
ActifImmobilier.hasMany(Loyer, { foreignKey: 'actif_immobilier_id', as: 'loyers' });
Loyer.belongsTo(ActifImmobilier, { foreignKey: 'actif_immobilier_id', as: 'actif_immobilier' });

// Locataire -> Loyer (One-to-Many)
Locataire.hasMany(Loyer, { foreignKey: 'locataire_id', as: 'loyers' });
Loyer.belongsTo(Locataire, { foreignKey: 'locataire_id', as: 'locataire' });

// ActifImmobilier -> Valorisation (One-to-Many)
ActifImmobilier.hasMany(Valorisation, { foreignKey: 'actif_immobilier_id', as: 'valorisations' });
Valorisation.belongsTo(ActifImmobilier, { foreignKey: 'actif_immobilier_id', as: 'actif_immobilier' });

// ActifImmobilier -> Financement (One-to-Many)
ActifImmobilier.hasMany(Financement, { foreignKey: 'actif_immobilier_id', as: 'financements' });
Financement.belongsTo(ActifImmobilier, { foreignKey: 'actif_immobilier_id', as: 'actif_immobilier' });

// Relations avec les tables de calculs
ActifImmobilier.hasMany(CalculActifImmobilier, { foreignKey: 'actif_immobilier_id', as: 'calculs' });
CalculActifImmobilier.belongsTo(ActifImmobilier, { foreignKey: 'actif_immobilier_id', as: 'actif_immobilier' });

Loyer.hasMany(CalculLoyer, { foreignKey: 'loyer_id', as: 'calculs' });
CalculLoyer.belongsTo(Loyer, { foreignKey: 'loyer_id', as: 'loyer' });

Financement.hasMany(CalculFinancement, { foreignKey: 'financement_id', as: 'calculs' });
CalculFinancement.belongsTo(Financement, { foreignKey: 'financement_id', as: 'financement' });

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
  Societe,
  ActifImmobilier,
  Locataire,
  Loyer,
  Valorisation,
  Financement,
  CalculActifImmobilier,
  CalculLoyer,
  CalculFinancement
};