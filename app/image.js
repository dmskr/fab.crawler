const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.POSTGRESQL_URL);

class Image extends Sequelize.Model { }

Image.init({
  organization: Sequelize.INTEGER,
  record: Sequelize.INTEGER,
  key: Sequelize.STRING,
  url: Sequelize.STRING,
  localImageUrl: Sequelize.STRING,
}, { sequelize, modelName: 'image' });

exports.Image = Image;

