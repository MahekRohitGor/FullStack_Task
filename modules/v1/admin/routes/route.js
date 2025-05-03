const admins = require("../controller/admin");

const admin = (app) => {
    app.post("/v1/admin/login", admins.login);
    app.post("/v1/admin/create-product", admins.create_products);
    app.post("/v1/admin/edit-prod", admins.edit_products);

    app.get("/v1/admin/products", admins.product_listing);
    app.post("/v1/admin/delete-product", admins.delete_products);
}

module.exports = admin;