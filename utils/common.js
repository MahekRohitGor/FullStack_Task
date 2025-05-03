const crypto = require("crypto");

if (!process.env.HASH_KEY || !process.env.HASH_IV) {
    throw new Error("HASH_KEY and HASH_IV environment variables must be defined");
}

const key = Buffer.from(process.env.HASH_KEY, 'hex');
const iv = Buffer.from(process.env.HASH_IV, 'hex');
const database = require("../config/database");

class Common {
    encrypt(requestData) {
        try {
            if (!requestData) {
                return null;
            }
            const data = typeof requestData === "object" ? JSON.stringify(requestData) : requestData;
            const cipher = crypto.createCipheriv('AES-256-CBC', key, iv);
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            return encrypted;
        } catch (error) {
            console.error("Encryption error:", error);
            return error;
        }
    }

    decrypt(requestData) {
        try {
            if (!requestData) {
                return {};
            }
            const decipher = crypto.createDecipheriv('AES-256-CBC', key, iv);
            let decrypted = decipher.update(requestData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return this.isJson(decrypted) ? JSON.parse(decrypted) : decrypted;
        } catch (error) {
            console.log("Error in decrypting: ", error);
            return requestData;
        }
    }

    isJson(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    async requestValidation(v) {
        if (v.fails()) {
            const Validator_errors = v.getErrors();
            const error = Object.values(Validator_errors)[0][0];
            return {
                code: true,
                message: error
            };
        } 
        return {
            code: false,
            message: ""
        };
    }

    sendEncryptedResponse(res, statusCode, message, data) {
        const resp_data = {
            code: statusCode,
            message,
            data
        };
        return res.status(statusCode).send(this.encrypt(resp_data));
    }

    generateOtp(length){
        if(length <= 0){
            throw new Error("OTP length must be greater than 0");
        }
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * digits.length)];
        }
        return otp;
    }

    async check_email(email){
        try{
            const [results] = await database.query(`SELECT user_id from tbl_user where email_id = ? and is_active = 1 and is_deleted = 0`, [email]);
            if(results && Array.isArray(results) && results.length > 0 && results[0] !== null && results[0].user_id){
                return false;
            } else {
                return true;
            }
        } catch(error){
            console.log(error.message);
            return false
        }
    }

    async check_user_login(email){
        try{
            const [results] = await database.query(`SELECT user_id from tbl_user where email_id = ? and is_active = 1 and is_deleted = 0 and is_login = 1`, [email]);
            if(results && Array.isArray(results) && results.length > 0 && results[0] !== null && results[0].user_id){
                return true;
            } else {
                return false;
            }
        } catch(error){
            console.log(error.message);
            return false
        }
    }

    async check_admin_login(email){
        try{
            const [results] = await database.query(`SELECT admin_id from tbl_admin where email_id = ? and is_active = 1 and is_deleted = 0 and is_login = 1`, [email]);
            if(results && Array.isArray(results) && results.length > 0 && results[0].admin_id){
                return true;
            } else {
                return false;
            }
        } catch(error){
            console.log(error.message);
            return false
        }
    }

    async insert_device(data){
        try{
            const [resp] = await database.query(`INSERT INTO tbl_device_info SET ?`, data);
            return !!resp.insertId;
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async get_user_info(user_id){
        try{
            const [res] = await database.query(`SELECT u.user_id, u.full_name, u.email_id, d.device_type FROM tbl_user AS u LEft JOIN tbl_device_info AS d ON u.user_id = d.user_id WHERE u.user_id = ? AND u.is_active = 1 AND u.is_deleted = 0`, [user_id]);
            return res[0];
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async get_admin_info(user_id){
        try{
            const [res] = await database.query(`SELECT email_id, admin_id, profile_pic, `, [user_id]);
            return res[0];
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async insert_into_otp(data){
        try{
            const [resp] = await database.query(`INSERT INTO tbl_otp SET ?`, data);
            return !!resp.insertId;
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async getUser(email_id){
        try{
            const [res] = await database.query(`SELECT user_id, email_id, password_, is_active FROM tbl_user WHERE email_id = ? AND is_active = 1 AND is_deleted = 0`, [email_id]);
            if (res.length > 0) {
                return res[0];
            } else {
                return false;
            }
        } catch(error){
            console.log(error);
            return false;
        }
    }

    async getAdmin(email_id){
        try{
            const [res] = await database.query(`SELECT admin_id, email_id, password_, is_active FROM tbl_admin WHERE email_id = ? AND is_active = 1 AND is_deleted = 0`, [email_id]);
            if (res.length > 0) {
                return res[0];
            } else {
                return false;
            }
        } catch(error){
            console.log(error);
            return false;
        }
    }

    async updateUserData(user_id, data) {
        try {
            const [result] = await database.query(`UPDATE tbl_user SET ? WHERE user_id = ?`, [data, user_id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.log(error.message);
            return false;
        }
    }

    async updateAdminData(admin_id, data) {
        try {
            const [result] = await database.query(`UPDATE tbl_admin SET ? WHERE admin_id = ?`, [data, admin_id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.log(error.message);
            return false;
        }
    }

    async get_device_data(user_id){
        try{
            const [result] = await database.query(`SELECT device_type, time_zone, device_token, os_version, app_version from tbl_device_info where user_id = ?`, [user_id]);
            if(result && Array.isArray(result) && result.length > 0){
                return result[0];
            } else{
                return false;
            }
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async check_cart_item(prod_id, user_id){
        try{
            const [cart_data] = await database.query(`SELECT cart_id, product_id, qty from tbl_cart where product_id = ? and user_id = ?`, [prod_id, user_id]);

            if(cart_data && cart_data.length > 0 && Array.isArray(cart_data)){
                return cart_data[0];
            } else{
                return false;
            }
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async update_cart(data){
        try{
            const [resp] = await database.query(`UPDATE tbl_cart SET qty = ? where user_id = ? and product_id = ?`, [data.qty, data.user_id, data.product_id]);

            return resp.affectedRows > 0;
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async get_cart_items(user_id){
        try{
            const [res] = await database.query(`select user_id, product_id, qty, cart_id from tbl_cart where user_id = ?`, [user_id]);
            if(res && res.length > 0 && Array.isArray(res)){
                return res;
            } else{
                return false
            }
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async insert_into_order(data){
        try{
            const [rows] = await database.query(`INSERT INTO tbl_order_details SET ?`, [data]);
            return rows.affectedRows > 0;
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    generateOrderNum(length){
        if(length <= 0){
            throw new Error("Order Number length must be greater than 0");
        }
        const digits = '0123456789QWERTYUIOPASDFGHJKLZXCVBNM';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * digits.length)];
        }
        return otp;
    }

    async update_order(order_id, data){
        try{
            const [rows] = await database.query(`UPDATE tbl_order SET ? where order_id = ?`, [data, order_id]);            
            return rows.affectedRows > 0;
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async get_order_details(user_id){
        try{
            const [result] = await database.query(`select o.order_id, o.order_num, o.sub_total, 
            o.shipping_charge, o.grand_total, 
            o.status, o.payment_type, 
            a.address_line, a.city, a.state, a.pincode, a.country
            from tbl_order o inner join tbl_user_delivery_address a on a.address_id = o.address_id where o.user_id = ?;`, [user_id]);

            if(result && Array.isArray(result) && result.length > 0){
                return result;
            } else{
                return false;
            }

        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async get_products_info(product_id){
        try{
            const [data] = await database.query(`SELECT product_id, product_name, product_description, product_price from tbl_products where product_id = ? and is_deleted = 0`, [product_id]);
            if(data && Array.isArray(data) && data.length > 0){
                return data[0];
            } else{
                return false;
            }
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

    async get_order_by_id(order_id){
        try{
            const [orders] = await database.query(`SELECT order_id, order_num, status, grand_total from tbl_order where order_id = ?`, [order_id]);
            if(orders && orders.length > 0){
                return orders[0];
            } else{
                return false;
            }
        } catch(error){
            console.log(error.message);
            return false;
        }
    }

}

module.exports = new Common()