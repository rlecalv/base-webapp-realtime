import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ComparableAttributes } from '../types';

class Comparable extends Model<ComparableAttributes> implements ComparableAttributes {
  public id!: number;
  public type!: 'transaction' | 'offre';
  public source!: 'dvf' | 'seloger' | 'leboncoin' | 'pap' | 'bienici' | 'logic-immo' | 'autre';
  public adresse!: string;
  public code_postal!: string;
  public ville!: string;
  public surface!: number;
  public prix!: number;
  public prix_m2!: number;
  public date_transaction?: Date;
  public date_publication?: Date;
  public url_source?: string;
  public caracteristiques!: Record<string, any>;
  public distance_bien?: number;
  public latitude?: number;
  public longitude?: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Comparable.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('transaction', 'offre'),
    allowNull: false
  },
  source: {
    type: DataTypes.ENUM('dvf', 'seloger', 'leboncoin', 'pap', 'bienici', 'logic-immo', 'autre'),
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
  surface: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  prix: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  prix_m2: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Prix au m² calculé automatiquement'
  },
  date_transaction: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de transaction pour les comparables de type transaction'
  },
  date_publication: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de publication pour les comparables de type offre'
  },
  url_source: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  caracteristiques: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Caractéristiques additionnelles du bien comparable'
  },
  distance_bien: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Distance en km par rapport au bien estimé'
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
  tableName: 'comparables',
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
      fields: ['source']
    },
    {
      fields: ['latitude', 'longitude']
    },
    {
      fields: ['date_transaction']
    },
    {
      fields: ['date_publication']
    }
  ],
  hooks: {
    beforeSave: async (comparable: Comparable) => {
      if (comparable.surface && comparable.surface > 0 && comparable.prix) {
        comparable.prix_m2 = Number((Number(comparable.prix) / Number(comparable.surface)).toFixed(2));
      }
    }
  }
});

export default Comparable;

