import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ActifImmobilierAttributes {
  id: number;
  societe_id: number;
  nom: string;
  type_bien: string;
  adresse: string;
  code_postal: string;
  ville: string;
  surface_totale?: number;
  surface_louable?: number;
  nombre_lots?: number;
  date_acquisition?: Date;
  prix_acquisition?: number;
  frais_acquisition?: number;
  valeur_actuelle?: number;
  date_derniere_evaluation?: Date;
  methode_evaluation?: string;
  rendement_brut?: number;
  rendement_net?: number;
  taux_occupation?: number;
  charges_annuelles?: number;
  taxe_fonciere?: number;
  assurance?: number;
  frais_gestion?: number;
  travaux_annuels?: number;
  pourcentage_detention?: number;
  description?: string;
  actif: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ActifImmobilierCreationAttributes extends Optional<ActifImmobilierAttributes, 'id' | 'created_at' | 'updated_at'> {}

class ActifImmobilier extends Model<ActifImmobilierAttributes, ActifImmobilierCreationAttributes> implements ActifImmobilierAttributes {
  public id!: number;
  public societe_id!: number;
  public nom!: string;
  public type_bien!: string;
  public adresse!: string;
  public code_postal!: string;
  public ville!: string;
  public surface_totale?: number;
  public surface_louable?: number;
  public nombre_lots?: number;
  public date_acquisition?: Date;
  public prix_acquisition?: number;
  public frais_acquisition?: number;
  public valeur_actuelle?: number;
  public date_derniere_evaluation?: Date;
  public methode_evaluation?: string;
  public rendement_brut?: number;
  public rendement_net?: number;
  public taux_occupation?: number;
  public charges_annuelles?: number;
  public taxe_fonciere?: number;
  public assurance?: number;
  public frais_gestion?: number;
  public travaux_annuels?: number;
  public pourcentage_detention?: number;
  public description?: string;
  public actif!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ActifImmobilier.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    societe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'societes',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    nom: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    type_bien: {
      type: DataTypes.ENUM('appartement', 'maison', 'bureau', 'commerce', 'entrepot', 'terrain', 'immeuble', 'parking', 'autre'),
      allowNull: false,
    },
    adresse: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    code_postal: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    ville: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    surface_totale: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    surface_louable: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    nombre_lots: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    date_acquisition: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    prix_acquisition: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    frais_acquisition: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    valeur_actuelle: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    date_derniere_evaluation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    methode_evaluation: {
      type: DataTypes.ENUM('expertise', 'comparaison', 'revenus', 'cout_remplacement', 'autre'),
      allowNull: true,
    },
    rendement_brut: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    rendement_net: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    taux_occupation: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 100.00,
    },
    charges_annuelles: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    taxe_fonciere: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    assurance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    frais_gestion: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    travaux_annuels: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    pourcentage_detention: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Pourcentage de détention FINDEV en pourcentage (ex: 25.00 pour 25%)',
      validate: {
        min: 0,
        max: 100,
      },
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
    modelName: 'ActifImmobilier',
    tableName: 'actifs_immobiliers',
    indexes: [
      {
        fields: ['societe_id'],
      },
      {
        fields: ['type_bien'],
      },
      {
        fields: ['ville'],
      },
      {
        fields: ['actif'],
      },
      {
        fields: ['date_acquisition'],
      },
    ],
  }
);

export default ActifImmobilier;
