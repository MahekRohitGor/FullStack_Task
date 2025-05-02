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
// const { response } = require("../../../../../../HLIS/NodeExam27/utilities/common");


class UserModel {
    async signup(request_data) {
        try {
            const checkEmailUnique = await common.check_email(request_data.email_id);
            if (checkEmailUnique) {
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

                if (!data.insertId) {
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('user_register_failed'),
                        data: null
                    }
                } else {
                    const user_id = data.insertId;
                    const user_token = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });

                    const device_data = {
                        user_id,
                        device_token: request_data.device_token,
                        device_type: request_data.device_type,
                        time_zone: request_data.time_zone,
                        ...(request_data.os_version != undefined && request_data.os_version != "") && { os_version: request_data.os_version },
                        ...(request_data.app_version != undefined && request_data.app_version != "") && { app_version: request_data.app_version }
                    }

                    const deviceInsertRes = await common.insert_device(device_data);
                    if (deviceInsertRes) {
                        const otp_data = {
                            user_id: user_id,
                            verify_with: request_data.verify_with,
                            otp: common.generateOtp(4)
                        }

                        const otp_insert = await common.insert_into_otp(otp_data);

                        if (otp_insert) {
                            const user_info = await common.get_user_info(user_id);
                            if (user_info) {
                                const response_data = {
                                    userInfo: user_info,
                                    user_token: user_token
                                }

                                return {
                                    code: response_code.SUCCESS,
                                    message: "Signup successfully",
                                    data: response_data
                                };

                            } else {
                                return {
                                    code: response_code.OPERATION_FAILED,
                                    message: "error_while_signup",
                                    data: null
                                };
                            }
                        } else {
                            return {
                                code: response_code.OPERATION_FAILED,
                                message: "error_while_sending_otp",
                                data: null
                            };
                        }

                    } else {
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: t('device_insert_failed'),
                            data: null
                        }
                    }
                }

            } else {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('email_already_exists'),
                    data: null
                }
            }

        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async login(request_data) {
        try {
            const not_existing_user = await common.check_email(request_data.email_id);

            if (not_existing_user) {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('invalid_email'),
                    data: null
                }
            } else {
                const is_login = await common.check_user_login(request_data.email_id);
                if(is_login){
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('already_login'),
                        data: null
                    }
                }
                
                const userDetails = await common.getUser(request_data.email_id);
                if (bcrypt.compareSync(request_data.password_, userDetails.password_)) {
                    if (userDetails.is_active == 1) {
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
                        if (updated_data) {
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

                        } else {
                            return {
                                code: response_code.OPERATION_FAILED,
                                message: t('error_updating_data'),
                                data: null
                            }
                        }

                    } else {
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: t('inactive_account'),
                            data: null
                        }
                    }

                } else {
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('invalid_password'),
                        data: null
                    }
                }
            }

        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async logout(user_id) {
        try {
            const user_data = await common.get_user_info(user_id);
            if (user_data) {
                const device_data = await common.get_device_data(user_id);
                if (device_data) {
                    const updated_device_data = {
                        device_type: null,
                        time_zone: "",
                        device_token: "",
                        os_version: "",
                        app_version: ""
                    }

                    const [result] = await database.query(`UPDATE tbl_device_info SET ? where user_id = ?`, [updated_device_data, user_id]);
                    if (result.affectedRows > 0) {
                        const [data] = await database.query(`UPDATE tbl_user set is_login = 0 where user_id = ?`, [user_id]);
                        if (data.affectedRows > 0) {
                            return {
                                code: response_code.SUCCESS,
                                message: "Logout Success",
                                data: user_id
                            }
                        } else {
                            return {
                                code: response_code.OPERATION_FAILED,
                                message: "Failed to Update User Login Status",
                                data: null
                            }
                        }
                    } else {
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: "Device details update failed",
                            data: null
                        }
                    }

                } else {
                    return {
                        code: response_code.NOT_FOUND,
                        message: "Device Data Not Found",
                        data: null
                    }
                }
            } else {
                return {
                    code: response_code.NOT_FOUND,
                    message: "User Not Found",
                    data: null
                }
            }

        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async addToCart(request_data, user_id) {
        try {
            if (!request_data.product_id || request_data.qty <= 0) {
                return {
                    code: response_code.BAD_REQUEST,
                    message: "No Products provided to add to cart or invalid quantity",
                    data: null
                }
            } else {
                const checkCart = await common.check_cart_item(request_data.product_id, user_id);
                if (checkCart) {
                    const data = {
                        qty: request_data.qty,
                        user_id: user_id,
                        product_id: request_data.product_id
                    }
                    const update_cart = await common.update_cart(data);
                    if (update_cart) {
                        return {
                            code: response_code.SUCCESS,
                            message: "Add to cart Success (Quantity Updated Successfully)",
                            data: request_data.product_id
                        }
                    } else {
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: "Failed to Update Qty",
                            data: null
                        }
                    }

                } else {
                    const cart_obj = {
                        user_id: user_id,
                        product_id: request_data?.product_id,
                        qty: request_data?.qty
                    }

                    const [result] = await database.query(`INSERT INTO tbl_cart SET ?`, [cart_obj]);

                    if (result.affectedRows > 0) {
                        return {
                            code: response_code.SUCCESS,
                            message: "Add to cart Success",
                            data: request_data.product_id
                        }
                    } else {
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: "Failed to Add to Cart",
                            data: null
                        }
                    }
                }
            }

        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async place_order(request_data, user_id) {
        try {
            const cart_data = await common.get_cart_items(user_id);
            let sub_total = 0;

            if (cart_data) {
                const order_num = common.generateOrderNum(8);
                const order_data = {
                    order_num: order_num,
                    user_id: user_id,
                    status: 'pending'
                }

                const [result_order] = await database.query(`INSERT INTO tbl_order SET ?`, [order_data]);
                if (result_order.affectedRows > 0) {
                    const order_id = result_order.insertId;

                    for (const prod of cart_data) {
                        const [price] = await database.query(`SELECT product_price from tbl_products where product_id = ?`, [prod.product_id]);
                        if (!price || price.length === 0) continue;

                        const cost = price[0].product_price * prod.qty;
                        sub_total += cost;

                        const order_details_data = {
                            order_id: order_id,
                            product_id: prod.product_id,
                            qty: prod.qty,
                            price: cost
                        }

                        const order_details = await common.insert_into_order(order_details_data);

                        if (order_details) {
                            const shipping_charge = 100;
                            const grand_total = sub_total + shipping_charge;

                            const data_to_update = {
                                status: 'confirmed',
                                sub_total: sub_total,
                                grand_total: grand_total,
                                shipping_charge: shipping_charge,
                                payment_type: request_data.payment_type,
                                address_id: request_data.address_id,
                            }

                            const resp_order_update = await common.update_order(order_id, data_to_update);
                            if (resp_order_update) {
                                await database.query(`DELETE FROM tbl_cart WHERE user_id = ?`, [user_id]);
                                return {
                                    code: response_code.SUCCESS,
                                    message: t('order_placed_successfully'),
                                    data: {
                                        order_id,
                                        order_num,
                                        grand_total
                                    }
                                };

                            } else {
                                return {
                                    code: response_code.OPERATION_FAILED,
                                    message: t('error_updating_order'),
                                    data: null
                                }
                            }

                        } else {
                            return {
                                code: response_code.OPERATION_FAILED,
                                message: t('error_adding_order_details'),
                                data: null
                            }
                        }
                    }
                } else {
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('error_adding_order_data'),
                        data: null
                    }
                }
            } else {
                return {
                    code: response_code.NOT_FOUND,
                    message: t("no_data_provided_to_place_order"),
                    data: null
                }
            }
        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async product_listing() {
        try {
            const [products] = await database.query(`SELECT p.product_id, p.product_name, p.product_price, pi.image_name,c.category_name FROM tbl_products p left JOIN tbl_product_images pi ON p.product_id = pi.product_id left join tbl_category c on c.category_id = p.category_id;`);

            if (products && products != null && Array.isArray(products) && products.length > 0) {
                return {
                    code: response_code.SUCCESS,
                    message: "Products Found",
                    data: products
                }

            } else {
                return {
                    code: response_code.NOT_FOUND,
                    message: "Products Not Found",
                    data: null
                }
            }

        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async get_product_by_id(id) {
        try {
            const product_id = id;

            const [products] = await database.query(`SELECT p.product_id, p.product_name, p.product_price, p.product_description, pi.image_name,c.category_name FROM tbl_products p left JOIN tbl_product_images pi ON p.product_id = pi.product_id left join tbl_category c on c.category_id = p.category_id where p.product_id = ?;`, [product_id]);

            if (products && products != null && Array.isArray(products) && products.length > 0) {
                const product = {
                    product_id: products[0].product_id,
                    name: products[0].product_name,
                    price: products[0].product_price,
                    description: products[0].product_description,
                    images: products.map(row => row.image_name)
                };

                return {
                    code: response_code.SUCCESS,
                    message: t('product_found_successfully'),
                    data: product
                };
            } else {
                return {
                    code: response_code.NOT_FOUND,
                    message: "Product Not Found",
                    data: null
                }
            }

        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async prod_filtering(request_data) {
        try {
            let page = (request_data.page && request_data.page > 0) ? request_data.page : 1;
            const limit = 10;
            const start = (page - 1) * limit;

            let conditions = [];

            if (request_data.category && Array.isArray(request_data.category) && request_data.category.length > 0) {
                conditions.push(`p.category_id IN (${request_data.category.join(",")})`);
            }
            if (request_data.search && request_data.search.trim() !== '') {
                conditions.push(`(p.product_name LIKE '%${request_data.search.trim()}%')`);
            }

            if (request_data.max_price) {
                const maxPrice = request_data.max_price;
                conditions.push(`p.product_price < ${maxPrice}`);
            }

            conditions.push("p.is_deleted = 0");

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

            const [data] = await database.query(`SELECT 
                p.product_id, 
                p.product_name, 
                p.product_price, 
                p.product_description,
                GROUP_CONCAT(DISTINCT pi.image_name SEPARATOR ',') AS images,
                c.category_name,
                c.category_id
                FROM tbl_products p
                LEFT JOIN tbl_product_images pi ON p.product_id = pi.product_id 
                    AND (pi.is_deleted = 0 OR pi.is_deleted IS NULL)
                LEFT JOIN tbl_category c ON c.category_id = p.category_id
                ${whereClause}
                GROUP BY p.product_id, p.product_name, p.product_price, p.product_description, c.category_name, c.category_id
                LIMIT ?, ?`, [start, limit]);

            if (data && Array.isArray(data) && data.length > 0) {

                return {
                    code: response_code.SUCCESS,
                    message: t('data_found'),
                    data: data
                }

            } else {
                return {
                    code: response_code.NOT_FOUND,
                    message: t('no_products_found'),
                    data: null
                }
            }

        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: "Internal Server Error",
                data: null
            }
        }
    }

    async user_information(user_id){
        try{
            if(user_id){
                const [data] = await database.query(`select full_name, email_id, code_id, phone_number, about from tbl_user where user_id = ?`, [user_id]);

                if(data && Array.isArray(data) && data.length > 0){
                    var order_data = await common.get_order_details(user_id);
                    let response_data = {
                        full_name: data[0].full_name,
                        email_id: data[0].email_id,
                        code_id: data[0].code_id,
                        phone_number: data[0].phone_number,
                        about: data[0].about
                    };

                    if(order_data){
                        response_data.orders = order_data;
                    } else{
                        response_data.orders = []
                    }

                    return {
                        code: response_code.SUCCESS,
                        message: t('user_found'),
                        data: response_data
                    }

                } else{
                    return {
                        code: response_code.NOT_FOUND,
                        message: t('user_not_found'),
                        data: null
                    }
                }
            } else{
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('invalid_user_id'),
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

    async edit_profile(request_data, user_id){
        try{
            const updated_fields = {};
            if(request_data.full_name){
                updated_fields.full_name = request_data.full_name;
            }
            if(request_data.profile_pic){
                updated_fields.profile_pic = request_data.profile_pic;
            }
            if(request_data.about){
                updated_fields.about = request_data.about;
            }

            if(Object.keys(updated_fields).length === 0){
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t("no_data_provided_for_update"),
                    data: null
                }
            } else{
                const [upated_user] = await database.query(`UPDATE tbl_user SET ? where user_id = ?`, [updated_fields, user_id]);

                if(upated_user.affectedRows > 0){
                    return {
                        code: response_code.SUCCESS,
                        message: t('update_user_success'),
                        data: user_id
                    }
                } else{
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('update_user_failed'),
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
}

module.exports = new UserModel();