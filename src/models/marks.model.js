const markModel = (sequelize, DataTypes) => {
    const Mark = sequelize.define("mark", {
      subject: {
        type: DataTypes.STRING,
        allowNull: false
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
    },{
        timestamps: true
    });
  
    return Mark;
  };
  
module.exports = markModel;
