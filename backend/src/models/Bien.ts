import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { BienAttributes } from '../types';

class Bien extends Model<BienAttributes> implements BienAttributes {
  public id!: number;
  public type!: 'immeuble_bloc' | 'appartement' | 'maison' | 'part_indivise';
  public adresse!: string;
  public code_postal!: string;
  public ville!: string;
  public departement!: string;
  public surface_totale!: number;
  public nombre_lots?: number;
  public quote_part?: number;
  public annee_construction?: number;
  public etat_general!: 'excellent' | 'bon' | 'moyen' | 'a_renover';
  public caracteristiques!: Record<string, any>;
  public latitude?: number;
  public longitude?: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Bien.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('immeuble_bloc', 'appartement', 'maison', 'part_indivise'),
    allowNull: false
  },
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  code_postal: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      is: /^\d{5}$/
    }
  },
  ville: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  departement: {
    type: DataTypes.STRING(3),
    allowNull: false
  },
  surface_totale: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  nombre_lots: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  quote_part: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    validate: {
      min: 0,
      max: 1
    },
    comment: 'Quote-part pour les parts indivises (entre 0 et 1)'
  },
  annee_construction: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1000,
      max: new Date().getFullYear() + 1
    }
  },
  etat_general: {
    type: DataTypes.ENUM('excellent', 'bon', 'moyen', 'a_renover'),
    allowNull: false,
    defaultValue: 'bon'
  },
  caracteristiques: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Caractéristiques additionnelles (parking, ascenseur, etc.)'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
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
  tableName: 'biens',
  indexes: [
    {
      fields: ['code_postal']
    },
    {
      fields: ['ville']
    },
    {
      fields: ['type']
    },
    {
      fields: ['latitude', 'longitude']
    }
  ]
});

export default Bien;

