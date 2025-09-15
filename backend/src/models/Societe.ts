import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface SocieteAttributes {
  id: number;
  nom: string;
  siret?: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  telephone?: string;
  email?: string;
  forme_juridique?: string;
  capital_social?: number;
  date_creation?: Date;
  secteur_activite?: string;
  description?: string;
  actif: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface SocieteCreationAttributes extends Optional<SocieteAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Societe extends Model<SocieteAttributes, SocieteCreationAttributes> implements SocieteAttributes {
  public id!: number;
  public nom!: string;
  public siret?: string;
  public adresse?: string;
  public code_postal?: string;
  public ville?: string;
  public telephone?: string;
  public email?: string;
  public forme_juridique?: string;
  public capital_social?: number;
  public date_creation?: Date;
  public secteur_activite?: string;
  public description?: string;
  public actif!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Societe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nom: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    siret: {
      type: DataTypes.STRING(14),
      allowNull: true,
      unique: true,
      validate: {
        len: [14, 14],
      },
    },
    adresse: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    code_postal: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ville: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    forme_juridique: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    capital_social: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    secteur_activite: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Societe',
    tableName: 'societes',
    indexes: [
      {
        fields: ['nom'],
      },
      {
        fields: ['siret'],
        unique: true,
        where: {
          siret: {
            [Op.ne]: null,
          },
        },
      },
      {
        fields: ['actif'],
      },
    ],
  }
);

export default Societe;
