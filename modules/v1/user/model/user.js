const common = require("../../../../utils/common");
const database = require("../../../../config/database");
const response_code = require("../../../../utils/response-error-code");
// const md5 = require("md5");
// const {default: localizify} = require('localizify');
// const en = require("../../../../language/en");
// const fr = require("../../../../language/fr");
// const guj = require("../../../../language/guj");
// const validator = require("../../../../middlewares/validator");
// var lib = require('crypto-lib');
// const moment = require("moment");
const { t } = require('localizify');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const moment = require('moment');


class UserModel{
    async signup(request_data){
        try{
            const checkEmailUnique = await common.check_email(request_data.email_id);
            if(checkEmailUnique){
                const signup_data = {
                    full_name: request_data.full_name,
                    email_id: request_data.email_id,
                    password_: bcrypt.hashSync(request_data.password_, 10),
                    phone_number: request_data.phone_number,
                    code_id: request_data.code_id,
                    is_step: '3',
                    is_profile_completed: 1
                }
                const [data] = await database.query(`INSERT INTO tbl_user SET ?`, [signup_data]);

                if(!data.insertId){
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('user_register_failed'),
                        data: null
                    }
                } else{
                    const user_id = data.insertId;
                    const user_token = jwt.sign({user_id: user_id}, process.env.JWT_SECRET, {expiresIn: '1d'});

                    const device_data = {
                        user_id,
                        device_token: request_data.device_token,
                        device_type: request_data.device_type,
                        time_zone: request_data.time_zone,
                        ...(request_data.os_version != undefined && request_data.os_version != "") && { os_version: request_data.os_version },
                        ...(request_data.app_version != undefined && request_data.app_version != "") && { app_version: request_data.app_version }
                    }

                    const deviceInsertRes = await common.insert_device(device_data);
                    if(deviceInsertRes){
                        const otp_data = {
                            user_id: user_id,
                            verify_with: request_data.verify_with,
                            otp: common.generateOtp(4)
                        }

                        const otp_insert = await common.insert_into_otp(otp_data);

                        if(otp_insert){
                            const user_info = await common.get_user_info(user_id);
                            if(user_info){
                                const response_data = {
                                    userInfo: user_info,
                                    user_token: user_token
                                }

                                return {
                                    code: response_code.SUCCESS,
                                    message: "Signup successfully" ,
                                    data: response_data
                                };

                            } else{
                                return {
                                    code: response_code.OPERATION_FAILED,
                                    message: "error_while_signup" ,
                                    data: null
                                };
                            }
                        } else{
                            return {
                                code: response_code.OPERATION_FAILED,
                                message: "error_while_sending_otp" ,
                                data: null
                            };
                        }

                    } else{
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: t('device_insert_failed'),
                            data: null
                        }
                    }
                }

            } else{
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('email_already_exists'),
                    data: null
                }
            }

        } catch(error){
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async login(request_data){
        try{
            const not_existing_user = await common.check_email(request_data.email_id);

            if(not_existing_user){
                return {
                    code: response_code.SUCCESS,
                    message: t('invalid_email'),
                    data: null
                }
            } else{
                const userDetails = await common.getUser(request_data.email_id);

                if(bcrypt.compareSync(request_data.password_, userDetails.password_)){
                    if(userDetails.is_active == 1){
                        const user_token = jwt.sign(
                            { id: userDetails.user_id },
                            process.env.JWT_SECRET,
                            { expiresIn: '1d' }
                        );
                        console.log(user_token);
    
                        // let insert_device = {
                        //     user_id: userDetails.user_id,
                        //     device_token: request_data.device_token,
                        //     device_type: request_data.device_type,
                        //     ...(request_data.device_type != undefined && request_data.device_type != "") && { device_type: request_data.device_type },
                        //     ...(request_data.os_version != undefined && request_data.os_version != "") && { os_version: request_data.os_version },
                        //     ...(request_data.app_version != undefined && request_data.app_version != "") && { app_version: request_data.app_version }
                        // };
    
                        // await common.insert_device(insert_device);
    
                        let update_data = {
                            last_login: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
                            is_login: 1
                        };
    
                        const updated_data = await common.updateUserData(userDetails.user_id, update_data);
                        if(updated_data){
                            const userInfo = await common.get_user_info(userDetails.user_id);
                            const response_data = {
                                userInfo: userInfo,
                                user_token: user_token
                            }

                            return {
                                code: response_code.SUCCESS,
                                message: 'login_success',
                                data: response_data
                            };
                        
                        } else{
                            return {
                                code: response_code.OPERATION_FAILED,
                                message: t('error_updating_data'),
                                data: null
                            }
                        }

                    } else{
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: t('inactive_account'),
                            data: null
                        }
                    }

                } else{
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('invalid_password'),
                        data: null
                    }
                }
            }

        } catch(error){
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async logout(user_id){
        try{
            const user_data = await common.get_user_info(user_id);
            if(user_data){
                const device_data = await common.get_device_data(user_id);
                if(device_data){
                    const updated_device_data = {
                        device_type: null,
                        time_zone: "",
                        device_token: "",
                        os_version: "",
                        app_version: ""
                    }

                    const [result] = await database.query(`UPDATE tbl_device_info SET ? where user_id = ?`, [updated_device_data, user_id]);
                    if(result.affectedRows > 0){
                        const [data] = await database.query(`UPDATE tbl_user set is_login = 0 where user_id = ?`, [user_id]);
                        if(data.affectedRows > 0){
                            return{
                                code: response_code.SUCCESS,
                                message: "Logout Success",
                                data: user_id
                            }
                        } else{
                            return{
                                code: response_code.OPERATION_FAILED,
                                message: "Failed to Update User Login Status",
                                data: null
                            }
                        }
                    } else{
                        return{
                            code: response_code.OPERATION_FAILED,
                            message: "Device details update failed",
                            data: null
                        }
                    }

                } else{
                    return {
                        code: response_code.NOT_FOUND,
                        message: "Device Data Not Found",
                        data: null
                    }
                }
            } else{
                return {
                    code: response_code.NOT_FOUND,
                    message: "User Not Found",
                    data: null
                }
            }

        } catch(error){
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async get_products(){
        try{
            

        } catch(error){
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async addToCart(request_data, user_id){
        try{
            if(!request_data.product_id || request_data.qty <= 0){
                return {
                    code: response_code.BAD_REQUEST,
                    message: "No Products provided to add to cart or invalid quantity",
                    data: null
                }
            } else{
                const checkCart = await common.check_cart_item(request_data.product_id, user_id);
                if(checkCart){
                    const data = {
                        qty: request_data.qty,
                        user_id: user_id,
                        product_id: request_data.product_id
                    }
                    const update_cart = await common.update_cart(data);
                    if(update_cart){
                        return {
                            code: response_code.SUCCESS,
                            message: "Add to cart Success (Quantity Updated Successfully)",
                            data: request_data.product_id
                        }
                    }else{
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: "Failed to Update Qty",
                            data: null
                        }
                    }

                } else{
                    const cart_obj = {
                        user_id: user_id,
                        product_id: request_data?.product_id,
                        qty: request_data?.qty
                    }

                    const [result] = await database.query(`INSERT INTO tbl_cart SET ?`, [cart_obj]);

                    if(result.affectedRows > 0){
                        return {
                            code: response_code.SUCCESS,
                            message: "Add to cart Success",
                            data: request_data.product_id
                        }
                    } else{
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: "Failed to Add to Cart",
                            data: null
                        }
                    }
                }
            }
            
        } catch(error){
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async place_order(request_data, user_id){
        try{
            const cart_data = await common.get_cart_items(user_id);
            if(cart_data){
                

            } else{
                return {
                    code: response_code.NOT_FOUND,
                    message: t("no_data_provided_to_place_order"),
                    data: null
                }
            }
        } catch(error){
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }
}

module.exports = new UserModel();