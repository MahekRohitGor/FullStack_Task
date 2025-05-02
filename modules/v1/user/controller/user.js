const user = require("../model/user");
const common = require("../../../../utils/common");
const response_code = require("../../../../utils/response-error-code");
const { default: localizify } = require("localizify");
const validator = require("../../../../middlewares/validator");
const { t } = require("localizify");
const vrules = require("../../../validation_rules");

class User {
    async signup(req, res) {
        try {
            const requested_data = req.body;
            const request_data = common.decrypt(requested_data);

            const rules = vrules.signup;
            const message = {
                required: t('required'),
                email: t('email'),
                'phone_number.min': t('mobile_number_min'),
                'phone_number.regex': t('mobile_number_numeric'),
                'password_.min': t('passwords_min')
            }
            const keywords = {
                'email_id': t('rest_keywords_email_id'),
                'password_': t('rest_keywords_password')
            }

            const isValid = await validator.checkValidationRules(req, res, request_data, rules, message, keywords);
            if (!isValid) return;

            const response = await user.signup(request_data);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);

        } catch (error) {
            console.error("Signup Error:", error);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async login(req,res){
        try {
            const requested_data = req.body;
            const request_data = common.decrypt(requested_data);

            const rules = vrules.login;
            const message = {
                required: t('required'),
                email_id: t('email_id')
            }
            const keywords = {
                'email_id': t('rest_keywords_email_id'),
                'password_': t('rest_keywords_password')
            }

            const isValid = await validator.checkValidationRules(req, res, request_data, rules, message, keywords);
            if (!isValid) return;

            const response = await user.login(request_data);
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

    async logout(req,res){
        try{
            const user_id = req.owner_id;
            const response = await user.logout(user_id);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);
        } catch(error){
            console.error("LOGOUT Error:", error);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async add_to_cart(req,res){
        try {
            const requested_data = req.body;
            const user_id = req.owner_id;
            const request_data = common.decrypt(requested_data);

            const rules = vrules.add_to_cart;
            const message = {
                required: t('required'),
                integer: t('must_be_integer'),
                min: t('minimum_value_required')
            };
            
            const keywords = {
                'product_id': t('rest_keywords_product_id'),
                'qty': t('rest_keywords_quantity')
            };

            const isValid = await validator.checkValidationRules(req, res, request_data, rules, message, keywords);
            if (!isValid) return;

            const response = await user.addToCart(request_data, user_id);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);

        } catch (error) {
            console.error("Add to cart Error:", error);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async place_order(req,res){
        try{
            const requested_data = req.body;
            const user_id = req.owner_id;
            const request_data = common.decrypt(requested_data);

            const rules = vrules.place_order;
            const message = {
                required: t('required'),
                integer: t('must_be_integer'),
                string: t('must_be_string'),
                in: t('invalid_value_provided'),
                min: t('minimum_value_required')
            };

            const keywords = {
                'payment_type': t('rest_keywords_payment_type'),
                'address_id': t('rest_keywords_address_id')
            };

            const isValid = await validator.checkValidationRules(req, res, request_data, rules, message, keywords);
            if (!isValid) return;

            const response = await user.place_order(request_data, user_id);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);

        } catch (error) {
            console.error("Place Order Error:", error);
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
            const response = await user.product_listing();
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

    async product_by_id(req, res) {
        try {
            const prod_id = req.params.id;
            const response = await user.get_product_by_id(prod_id);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);
        } catch (error) {
            console.error("Get Product By ID Error:", error.message);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async filter(req, res) {
        try {
            const requested_data = req.body;
            const request_data = common.decrypt(requested_data);

            const response = await user.prod_filtering(request_data);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);
        } catch (error) {
            console.error("Get Product By ID Error:", error.message);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async user_info(req, res) {
        try {
            const user_id = req.owner_id;

            const response = await user.user_information(user_id);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);
        } catch (error) {
            console.error("User Info Fetch Error:", error.message);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

    async edit_profile(req,res){
        try{
            const requested_data = req.body;
            const user_id = req.owner_id;
            const request_data = common.decrypt(requested_data);

            const rules = vrules.edit_profile;
            const message = {
                string: t('must_be_string')
            };

            const keywords = {
                'full_name': t('rest_keywords_full_name'),
                'about': t('rest_keywords_about'),
                'profile_pic': t('rest_keywords_profile_pic')
            };

            const isValid = await validator.checkValidationRules(req, res, request_data, rules, message, keywords);
            if (!isValid) return;

            const response = await user.edit_profile(request_data, user_id);
            await common.sendEncryptedResponse(res, response_code.SUCCESS, response.message, response.data);

        } catch (error) {
            console.error("Edit Profile Error:", error);
            return common.sendEncryptedResponse(
                res,
                response_code.INTERNAL_SERVER_ERROR,
                t("internal_server_error") || "Something went wrong, please try again later.",
                {}
            );
        }
    }

}

module.exports = new User();