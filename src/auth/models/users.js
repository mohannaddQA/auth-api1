'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET || 'secretstring';

const userModel = (sequelize, DataTypes) => {
  const model = sequelize.define('Users', {
    username: { type: DataTypes.STRING, required: true, unique: true },
    password: { type: DataTypes.STRING, required: true },
    role: { type: DataTypes.ENUM('user', 'writer', 'editor', 'admin'), required: true, defaultValue: 'user'},
    token: {
      type: DataTypes.VIRTUAL  },
    capabilities: {
      type: DataTypes.VIRTUAL,
      get() {
        const acl = {
          user: ['read'],
          writer: ['read', 'create'],
          editor: ['read', 'create', 'update'],
          admin: ['read', 'create', 'update', 'delete']
        };
        return acl[this.role];
      }
    }
  });

  model.beforeCreate(async (user) => {
    let hashedPass = await bcrypt.hash(user.password, 10);
    user.password = hashedPass;
  });

 
  model.authenticateBasic = async function (username, password) {
    const user = await model.findOne({ where: { username } });
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      const userToken = jwt.sign({ username: user.username, password: user.password }, SECRET);
      // console.log(userToken);
      return {
        user,
        token: userToken,
      };
    } else {
      throw new Error('No User');
    }
  };

  model.authenticateToken = async function (token) {
    const parsedToken = jwt.verify(token, SECRET);
    const user = await model.findOne({ where: { username: parsedToken.username } });
    if (user.username) {
      return user;
    } else {
      throw new Error('Invalid Token');
    }
  };

  return model;
};

 

module.exports = userModel;