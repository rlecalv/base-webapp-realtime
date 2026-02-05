import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ScrapingJobAttributes } from '../types';

class ScrapingJob extends Model<ScrapingJobAttributes> implements ScrapingJobAttributes {
  public id!: number;
  public site!: string;
  public type!: 'annonces' | 'transactions';
  public statut!: 'en_attente' | 'en_cours' | 'termine' | 'erreur';
  public parametres!: Record<string, any>;
  public resultats?: Record<string, any>;
  public erreur?: string;
  public started_at?: Date;
  public completed_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;
}

ScrapingJob.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  site: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nom du site à scraper (seloger, leboncoin, etc.)'
  },
  type: {
    type: DataTypes.ENUM('annonces', 'transactions'),
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'en_cours', 'termine', 'erreur'),
    allowNull: false,
    defaultValue: 'en_attente'
  },
  parametres: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Paramètres de recherche (localisation, type de bien, etc.)'
  },
  resultats: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Résultats du scraping (nombre d\'annonces trouvées, etc.)'
  },
  erreur: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'scraping_jobs',
  indexes: [
    {
      fields: ['site']
    },
    {
      fields: ['type']
    },
    {
      fields: ['statut']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default ScrapingJob;

