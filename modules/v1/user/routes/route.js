const users = require("../controller/user");

const user = (app) => {
    app.post("/v1/user/signup", users.signup);
    app.post("/v1/user/login", users.login);
    app.post("/v1/user/logout", users.logout);

    app.post("/v1/user/add-to-cart", users.add_to_cart);
    app.post("/v1/user/place-order", users.place_order);

    app.get("/v1/user/products", users.product_listing);
    app.get("/v1/user/products/:id", users.product_by_id);

    app.post("/v1/user/filter", users.filter);
    app.get("/v1/user/info", users.user_info);
    app.post("/v1/user/edit", users.edit_profile);

    app.get("/v1/user/delivery-address", users.get_delivery_address);
    app.get("/v1/user/cart-details", users.add_to_cart_details);

    app.post("/v1/user/add-delivery-address", users.add_delivery_address);
    app.get("/v1/user/categories", users.get_categories);
}

module.exports = user;