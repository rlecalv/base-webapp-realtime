import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { LeadAttributes } from '../types';

class Lead extends Model<LeadAttributes> implements LeadAttributes {
  public id!: number;
  public estimation_id!: number;
  public email!: string;
  public telephone?: string;
  public nom?: string;
  public prenom?: string;
  public type_bien_interesse?: string;
  public budget_max?: number;
  public statut!: 'nouveau' | 'contacte' | 'convertis' | 'perdu';
  public notes?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Lead.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  estimation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'estimations',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^(\+33|0)[1-9](\d{2}){4}$/
    }
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  type_bien_interesse: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  budget_max: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  statut: {
    type: DataTypes.ENUM('nouveau', 'contacte', 'convertis', 'perdu'),
    allowNull: false,
    defaultValue: 'nouveau'
  },
  notes: {
    type: DataTypes.TEXT,
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
  tableName: 'leads',
  indexes: [
    {
      fields: ['estimation_id']
    },
    {
      fields: ['email']
    },
    {
      fields: ['statut']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default Lead;

