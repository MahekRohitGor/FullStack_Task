const response_code = require("../utils/response-error-code");
const common = require("../utils/common");
const lodash = require('lodash');
const { SUPPORTED_LANGUAGES } = require("../config/constants");
const { BYPASS_ROUTES } = require("../config/constants");
const jwt = require("jsonwebtoken");

class HeaderAuth{

    validateHeader(req, res, next){
        console.log(req.headers);
        const api_key = (req.headers['api-key'] != undefined && req.headers['api-key'] != null && req.headers['api-key'] != "") ? req.headers['api-key'] : '';
        console.log(api_key);
        const api_key_dec = common.decrypt(api_key);
        console.log(api_key_dec === process.env.API_KEY);
        if(api_key_dec != ""){
            try{
                if(api_key_dec === process.env.API_KEY){
                    next();
                } else{
                    return common.sendEncryptedResponse(res, response_code.UNAUTHORIZED, "Invalid API Key", null)
                }
            } catch(error){
                console.log(error);
                return common.sendEncryptedResponse(res, response_code.UNAUTHORIZED, "SOME ERROR OCCURED", null)
            }
        } else{
            return common.sendEncryptedResponse(res, response_code.UNAUTHORIZED, "Invalid API Key", null)
        }
        
    }

    extractMethod(request){
        const url = request.originalUrl;
        const segment = [];
        url.split("/").forEach((element) => {
            if(!lodash.isEmpty(element)){
                segment.push(element.trim());
            }
        });
        request.appVersion = segment[0];
        request.requestedModule = segment[1];
        request.requestMethod = segment[segment.length - 1];
        return request;
    }

    async getUserFromToken(token){
        try{
            console.log(token);
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            return decode;
        } catch(error){
            console.log(error.message);
            throw new Error("Invalid or Expired JWT Token");
        }
    }

    async header(req, res, next){
        try{
            const headers = req.headers;
            if(common.decrypt(headers['api-key']) === process.env.API_KEY){
                const headerObj = new HeaderAuth();
                req = headerObj.extractMethod(req);

                if(BYPASS_ROUTES.includes(req.requestMethod)){
                    return next();
                } else{
                    const token = headers['auth_token'];
                    console.log("token: ", token);
                    if(!token){
                        return common.sendEncryptedResponse(res, response_code.UNAUTHORIZED, "Authorization Token is Missing", null);
                    }
                    try{
                        const headObj = new HeaderAuth();
                        const decoded = await headObj.getUserFromToken(token);

                        if (req.requestedModule === 'admin') {
                            req.owner_id = decoded.admin_id
                        } else {
                            req.owner_id = decoded.user_id;
                        }
                        req.owner = decoded;
                        next();
                    } catch(error){
                        console.log(error);
                        return common.sendEncryptedResponse(res, response_code.UNAUTHORIZED, "Invalid Access Token", null);
                    }
                }
            } else{
                return common.sendEncryptedResponse(res, response_code.UNAUTHORIZED, "Invalid API Key", null);
            }

        } catch(error){
            console.log(error.message);
            return common.sendEncryptedResponse(res, response_code.UNAUTHORIZED, "Internal Server Error", null);
        }
    }

    
}

module.exports = new HeaderAuth();