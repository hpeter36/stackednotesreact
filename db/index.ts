import { Sequelize } from "sequelize";
import { initModels } from "./models/init-models";

const sequelizeAdapter = new Sequelize(
  process.env.DB_DB!,
  process.env.DB_USER!,
  process.env.DB_PW!,
  {
    host: process.env.DB_SERVER!,
    port: Number(process.env.DB_PORT!),
    dialect: "mariadb",
    define: {
      freezeTableName: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);
// sequelizeAdapter.close()

// creates tables
// Calling sync() is not recommended in production
//sequelize.sync();

const dbOrm = initModels(sequelizeAdapter);
export { dbOrm, sequelizeAdapter };
