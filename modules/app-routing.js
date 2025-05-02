class Routing{
    v1(app){
        const user = require("./v1/user/routes/route");
        const admin = require("./v1/admin/routes/route");
        user(app);
        admin(app);
    }
}

module.exports = new Routing();