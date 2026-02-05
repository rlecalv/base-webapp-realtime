import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { EstimationAttributes } from '../types';

class Estimation extends Model<EstimationAttributes> implements EstimationAttributes {
  public id!: number;
  public bien_id!: number;
  public user_id?: number;
  public valeur_estimee!: number;
  public valeur_min!: number;
  public valeur_max!: number;
  public methode!: 'comparables_dvf' | 'comparables_offres' | 'mixte';
  public nombre_comparables!: number;
  public confiance!: number;
  public details!: Record<string, any>;
  public created_at!: Date;
  public updated_at!: Date;
}

Estimation.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bien_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'biens',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  valeur_estimee: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  valeur_min: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  valeur_max: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  methode: {
    type: DataTypes.ENUM('comparables_dvf', 'comparables_offres', 'mixte'),
    allowNull: false
  },
  nombre_comparables: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  confiance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Score de confiance de 0 à 100'
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Détails de la méthodologie et des calculs'
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
  tableName: 'estimations',
  indexes: [
    {
      fields: ['bien_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default Estimation;

