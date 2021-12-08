const generateMsg = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMsg = (username, lat, long) => {
  let url = `https://google.com/maps?q=${lat},${long}`;
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMsg,
  generateLocationMsg,
};
