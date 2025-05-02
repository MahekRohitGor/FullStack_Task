const users = require("../controller/user");

const user = (app) => {
    app.post("/v1/user/signup", users.signup);
    app.post("/v1/user/login", users.login);
    app.post("/v1/user/logout", users.logout);

    app.post("/v1/user/add-to-cart", users.add_to_cart);
    app.post("/v1/user/place-order", users.place_order);
}

module.exports = user;