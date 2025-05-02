const { Sequelize, DataTypes } = require('sequelize');

const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT } = process.env

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
  port: DB_PORT,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

const DB = {}
DB.sequelize = sequelize;
DB.Sequelize = Sequelize;

// Import models
DB.studentModel = require("../models/student.model")(sequelize, DataTypes);
DB.marksModel = require("../models/marks.model")(sequelize, DataTypes);


// Define associations
// One-to-Many relationship between Student and Marks
DB.studentModel.hasMany(DB.marksModel, {
  foreignKey: 'student_id',
  as: 'marks'
});
DB.marksModel.belongsTo(DB.studentModel, {
  foreignKey: 'student_id',
  as: 'student'
});


// Sync all models
DB.sequelize.sync({ alter: true }).then(() => {
    console.log("All models were synchronized successfully.");
  });
  
module.exports = { DB, sequelize, Sequelize };
    