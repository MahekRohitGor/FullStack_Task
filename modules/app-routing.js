class Routing{
    v1(app){
        const user = require("./v1/user/routes/route");
        user(app);
    }
}

module.exports = new Routing();