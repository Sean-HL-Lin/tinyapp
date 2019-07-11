const getUserByEmail = function(tarEmail,database) {
  for (let item in database) {
    if (database[item].email === tarEmail) {
      return database[item];
    }
  }
  return undefined;
};

const generateRandomString = function() {
  const choice = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 1; i <= 6; i++) {
    result += choice[Math.floor(Math.random() * choice.length)];
  }
  return result;
};


module.exports = {getUserByEmail,generateRandomString};