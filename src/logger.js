const logger = (type) => {
  return (message) => {
    console.log(`[${type}]: ${message}`);
  };
};

const infoLogger = logger("INFO");
const errorLogger = logger("ERROR");
const warnLogger = logger("WARN");
const debugLogger = logger("DEBUG");

module.exports = { infoLogger, errorLogger, warnLogger, debugLogger };
