const admin = require("../model/admin");
const common = require("../../../../utils/common");
const response_code = require("../../../../utils/response-error-code");
const { default: localizify } = require("localizify");
const validator = require("../../../../middlewares/validator");
const { t } = require("localizify");
const vrules = require("../../../validation_rules");

class Admin {
    async login(req, res) {
        try {
            const requested_data = req.body;
            const request_data = common.decrypt(requested_data);

            const rules = vrules.login;
            const message = {
                required: t('required'),
                email_id: t('email_id_valid_format')
            }
            const keywords = {
                'email_id': t('rest_keywords_email_id'),
                'password_': t('rest_keywords_password')
            }

            const isValid = await validator.checkValidationRules(req, res, request_data, rules, message, keywords);
            if (!isValid) return;

            const response = await admin.login(request_data);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);
        } catch (error) {
            console.error("LOGIN Error:", error);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async create_products(req, res) {
        try {
            const requested_data = req.body;
            const request_data = common.decrypt(requested_data);

            const rules = vrules.create_products;
            const message = {
                required: t('required'),
                string: t('must_be_string'),
                numeric: t('must_be_numeric')
            };

            const keywords = {
                'product_name': t('rest_keywords_product_name'),
                'product_price': t('rest_keywords_product_price'),
                'product_description': t('rest_keywords_product_description'),
                'image_name': t('rest_keywords_image_name'),
                'category_id': t('rest_keywords_category_id')
            };

            const isValid = await validator.checkValidationRules(req, res, request_data, rules, message, keywords);
            if (!isValid) return;

            const response = await admin.create_product(request_data);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);

        } catch (error) {
            console.error("Create Product Error:", error);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async edit_products(req, res) {
        try {
            const requested_data = req.body;
            const request_data = common.decrypt(requested_data);
            const admin_id = req.owner_id;
            console.log(admin_id);

            const rules = vrules.edit_products;
            const message = {
                string: t('must_be_string'),
                numeric: t('must_be_numeric'),
                required: t('required')
            };

            const keywords = {
                'product_name': t('rest_keywords_product_name'),
                'product_price': t('rest_keywords_product_price'),
                'product_description': t('rest_keywords_product_description'),
                'product_id': t('rest_keywords_product_id')
            };

            const isValid = await validator.checkValidationRules(req, res, request_data, rules, message, keywords);
            if (!isValid) return;

            const response = await admin.edit_product(request_data);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);

        } catch (error) {
            console.error("Edit Product Error:", error);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async product_listing(req, res) {
        try {
            const response = await admin.product_listing();
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);
        } catch (error) {
            console.error("Get Order Error:", error.message);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async delete_products(req, res) {
        try {
            const requested_data = req.body;
            const request_data = common.decrypt(requested_data);

            const rules = vrules.delete_products;
            const message = {
                numeric: t('must_be_numeric'),
                required: t('required')
            };

            const keywords = {
                'product_id': t('rest_keywords_product_id')
            };

            const isValid = await validator.checkValidationRules(req, res, request_data, rules, message, keywords);
            if (!isValid) return;

            const response = await admin.delete_product(request_data);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);

        } catch (error) {
            console.error("Delete Product Error:", error);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async show_orders(req, res) {
        try {
            const requested_data = req.body;
            const request_data = common.decrypt(requested_data);

            const response = await admin.show_orders(request_data);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);
        } catch (error) {
            console.error("Delete Product Error:", error);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async update_status(req, res) {
        try {
            const requested_data = req.body;
            const request_data = common.decrypt(requested_data);

            const rules = vrules.update_status;
            const message = {
                numeric: t('must_be_numeric'),
                required: t('required'),
                string: t('must_be_string'),
                in: t('invalid_value_provided')
            };

            const keywords = {
                'order_id': t('rest_keywords_product_id'),
                'status': t('rest_keywords_status')
            };

            const isValid = await validator.checkValidationRules(req, res, request_data, rules, message, keywords);
            if (!isValid) return;

            const response = await admin.update_status(request_data);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);

        } catch (error) {
            console.error("UPDATE STATUS ERROR:", error);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }
}

module.exports = new Admin();