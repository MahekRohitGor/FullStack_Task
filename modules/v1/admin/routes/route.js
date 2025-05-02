const admins = require("../controller/admin");

const admin = (app) => {
    app.post("/v1/admin/login", admins.login);
    app.post("/v1/admin/create-product", admins.create_products);
    app.post("/v1/admin/edit-prod", admins.edit_products);
}

module.exports = admin;