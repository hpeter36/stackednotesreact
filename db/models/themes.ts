import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface themesAttributes {
  id: number;
  fc: string;
  sec: string;
  acc: string;
  prim: string;
  b_avg: number;
}

export type themesPk = "id";
export type themesId = themes[themesPk];
export type themesOptionalAttributes = "id";
export type themesCreationAttributes = Optional<themesAttributes, themesOptionalAttributes>;

export class themes extends Model<themesAttributes, themesCreationAttributes> implements themesAttributes {
  id!: number;
  fc!: string;
  sec!: string;
  acc!: string;
  prim!: string;
  b_avg!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof themes {
    return themes.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fc: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    sec: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    acc: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    prim: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    b_avg: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'themes',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
