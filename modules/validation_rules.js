const { add_to_cart } = require("../../../HLIS/NodeExam27/modules/v1/user/models/user_model");
const { delete_product } = require("./v1/admin/model/admin");

const rules = {
    signup: {
        email_id: "required|email",
        phone_number: "required|string|min:10|regex:/^[0-9]+$/|max:10",
        password_: "required|min:8",
        full_name: "required",
        code_id: "required"
    },

    login: {
        email_id: "required|email",
        password_: "required"
    },
    
    admin_login:{
        username: "required",
        password: "required"
    },

    add_to_cart:{
        qty: "required|integer|min:1",
        product_id: "required|integer"
    },
    place_order: {
        payment_type: "required|string|in:cod,debit,credit",
        address_id: "required|integer"
    },
    edit_profile: {
        full_name: "string",
        profile_pic: "string",
        about: "string"
    },
    create_products: {
        product_name: "required|string",
        product_price: "required|numeric",
        product_description: "required|string",
        image_name: "required|string",
        category_id: "required|numeric"
    },
    edit_products: {
        product_name: "string",
        product_price: "nullable|numeric",
        product_description: "string",
        product_id: "required"
    },
    delete_products: {
        product_id: "required|numeric"
    },
    update_status: {
        order_id: "required|numeric",
        status: "required|string|in:processed,shipped,completed,failed"
    }
}

module.exports = rules;