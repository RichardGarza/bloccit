const ApplicationPolicy = require("./application");

module.exports = class PostPolicy extends ApplicationPolicy {

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }
}