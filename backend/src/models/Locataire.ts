import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface LocataireAttributes {
  id: number;
  type_locataire: 'particulier' | 'entreprise';
  nom: string;
  prenom?: string;
  raison_sociale?: string;
  siret?: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  telephone?: string;
  email?: string;
  date_naissance?: Date;
  profession?: string;
  revenus_annuels?: number;
  garanties?: string;
  depot_garantie?: number;
  caution_solidaire?: boolean;
  nom_caution?: string;
  adresse_caution?: string;
  telephone_caution?: string;
  notes?: string;
  actif: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface LocataireCreationAttributes extends Optional<LocataireAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Locataire extends Model<LocataireAttributes, LocataireCreationAttributes> implements LocataireAttributes {
  public id!: number;
  public type_locataire!: 'particulier' | 'entreprise';
  public nom!: string;
  public prenom?: string;
  public raison_sociale?: string;
  public siret?: string;
  public adresse?: string;
  public code_postal?: string;
  public ville?: string;
  public telephone?: string;
  public email?: string;
  public date_naissance?: Date;
  public profession?: string;
  public revenus_annuels?: number;
  public garanties?: string;
  public depot_garantie?: number;
  public caution_solidaire?: boolean;
  public nom_caution?: string;
  public adresse_caution?: string;
  public telephone_caution?: string;
  public notes?: string;
  public actif!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Locataire.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type_locataire: {
      type: DataTypes.ENUM('particulier', 'entreprise'),
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    prenom: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    raison_sociale: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    siret: {
      type: DataTypes.STRING(14),
      allowNull: true,
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
    date_naissance: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    profession: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    revenus_annuels: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    garanties: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    depot_garantie: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    caution_solidaire: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    nom_caution: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    adresse_caution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    telephone_caution: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    notes: {
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
    modelName: 'Locataire',
    tableName: 'locataires',
    indexes: [
      {
        fields: ['type_locataire'],
      },
      {
        fields: ['nom'],
      },
      {
        fields: ['email'],
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

export default Locataire;
