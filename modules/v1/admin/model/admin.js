const common = require("../../../../utils/common");
const database = require("../../../../config/database");
const response_code = require("../../../../utils/response-error-code");
const { t } = require('localizify');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const moment = require('moment');

class AdminModel {

    async login(request_data) {
        try {
            const is_login = await common.check_admin_login(request_data.email_id);
            if (!is_login) {
                const admin_details = await common.getAdmin(request_data.email_id);
                if (bcrypt.compareSync(request_data.password_, admin_details.password_)) {
                    const admin_token = jwt.sign(
                        { id: admin_details.admin_id },
                        process.env.JWT_SECRET,
                        { expiresIn: '1d' }
                    );
                    console.log(admin_token);

                    let update_data = {
                        last_login: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
                        is_login: 1
                    };

                    const updated_data = await common.updateAdminData(admin_details.admin_id, update_data);
                    if (updated_data) {
                        const adminInfo = await common.get_admin_info(admin_details.admin_id);
                        const response_data = {
                            adminInfo: adminInfo,
                            admin_token: admin_token
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
                        message: t('incorrect_password'),
                        data: null
                    }
                }

            } else {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('already_login'),
                    data: null
                }
            }

        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: t('internal_server_error'),
                data: null
            }
        }
    }

    async create_product(request_data) {
        try {
            const product_data = {
                product_name: request_data.product_name,
                product_price: request_data.product_price,
                product_description: request_data.product_description,
                category_id: request_data.category_id
            }

            const [data] = await database.query(`INSERT INTO tbl_products SET ?`, [product_data]);
            const insertImage = {
                product_id: data.insertId,
                image_name: request_data.image_name
            }
            const [images] = await database.query(`INSERT INTO tbl_product_images SET ?`, [insertImage]);

            if (data.affectedRows > 0) {
                if (images.affectedRows > 0) {
                    return {
                        code: response_code.SUCCESS,
                        message: t('product_add_success'),
                        data: data.insertId
                    }
                } else {
                    await database.query(`DELETE FROM tbl_products WHERE product_id = ?`, [data.insertId]);
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('image_add_error'),
                        data: null
                    }
                }
            } else {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('failed_insert_data'),
                    data: null
                }
            }

        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: t('internal_server_error'),
                data: null
            }
        }
    }

    async edit_product(request_data) {
        try {
            const updated_fields = {};
            if (request_data.product_name) {
                updated_fields.product_name = request_data.product_name;
            }
            if (request_data.product_price) {
                updated_fields.product_price = request_data.product_price;
            }
            if (request_data.product_description) {
                updated_fields.product_description = request_data.product_description;
            }

            if (Object.keys(updated_fields).length === 0) {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t("no_data_provided_for_update"),
                    data: null
                }
            } else {
                const [upated_prods] = await database.query(`UPDATE tbl_products SET ? where product_id = ?`, [updated_fields, request_data.product_id]);

                if (upated_prods.affectedRows > 0) {
                    return {
                        code: response_code.SUCCESS,
                        message: t('update_product_success'),
                        data: { product_id: request_data.product_id }
                    }
                } else {
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('update_product_failed'),
                        data: null
                    }
                }
            }

        } catch (error) {
            console.log(error.message);
            return {
                code: response_code.OPERATION_FAILED,
                message: t('internal_server_error'),
                data: null
            }
        }
    }

    async product_listing() {
        try {
            const [products] = await database.query(`SELECT p.product_id, p.product_name, p.product_price, p.product_description, pi.image_name,c.category_name FROM tbl_products p left JOIN tbl_product_images pi ON p.product_id = pi.product_id left join tbl_category c on c.category_id = p.category_id where p.is_deleted = 0;`);

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

    async delete_product(request_data) {
        try {
            if (!request_data.product_id) {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('no_product_id_provided'),
                    data: null
                }
            } else {
                const data = await common.get_products_info(request_data.product_id);
                if (data) {
                    const [res] = await database.query(`UPDATE tbl_products SET is_deleted = 1 where product_id = ?`, [request_data.product_id]);
                    if (res.affectedRows > 0) {
                        return {
                            code: response_code.SUCCESS,
                            message: t('delete_success'),
                            data: request_data.product_id
                        }
                    } else {
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: t('delete_failed'),
                            data: null
                        }
                    }
                } else {
                    return {
                        code: response_code.NOT_FOUND,
                        message: t('product_already_deleted'),
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

    async update_status(request_data) {
        try {
            const order_data = await common.get_order_by_id(request_data.order_id);
            if (order_data) {
                if (request_data.status != order_data.status) {
                    const [updated_data] = await database.query(`UPDATE tbl_order SET status = ? where order_id = ?`, [request_data.status, request_data.order_id]);
                    if (updated_data.affectedRows > 0) {
                        return {
                            code: response_code.SUCCESS,
                            message: t('order_status_update_success'),
                            data: request_data.order_id
                        }
                    } else {
                        return {
                            code: response_code.OPERATION_FAILED,
                            message: t('failed_to_update_data'),
                            data: null
                        }
                    }
                } else {
                    return {
                        code: response_code.OPERATION_FAILED,
                        message: t('provide_different_status_to_update'),
                        data: null
                    }
                }
            } else {
                return {
                    code: response_code.OPERATION_FAILED,
                    message: t('failed_to_get_order_detail'),
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

    async show_orders(request_data) {
        try {
            let page = (request_data.page && request_data.page > 0) ? request_data.page : 1;
            const limit = 10;
            const start = (page - 1) * limit;

            const [orders] = await database.query(`select o.order_id, o.order_num, o.sub_total, 
            o.shipping_charge, o.grand_total, o.status, o.payment_type, u.full_name,
            u.email_id, u.profile_pic, u.user_id, da.address_line, da.city, da.state, da.pincode, da.country from tbl_order o left join 
            tbl_user u on o.user_id = u.user_id 
            left join tbl_user_delivery_address da 
            on da.address_id = o.address_id where u.is_deleted = 0 and da.is_deleted = 0 LIMIT ? OFFSET ?;`, [limit, start]);

            if(orders && orders.length > 0){
                return {
                    code: response_code.SUCCESS,
                    message: t('orders_found'),
                    data: orders
                }

            } else{
                return {
                    code: response_code.NOT_FOUND,
                    message: t('no_orders_found'),
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
}

module.exports = new AdminModel();