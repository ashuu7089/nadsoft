const studentModel = (sequelize, DataTypes) => {
    const students = sequelize.define('student', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        phone_number: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        age : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        timestamps: true
    });
    return students;
}

module.exports = studentModel;
