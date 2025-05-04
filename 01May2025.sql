create database db_task06;
use db_task06;

select * from tbl_user;

create table tbl_country_code(
	code_id bigint primary key auto_increment,
    counrty_name varchar(128),
    country_code char(8),
    is_active boolean default 1,
    is_deleted boolean default 0,
    created_at datetime default current_timestamp(),
    updated_at datetime on update current_timestamp()
);
INSERT INTO tbl_country_code (counrty_name, country_code) VALUES
('India', '+91'),
('United States', '+1'),
('United Kingdom', '+44'),
('Australia', '+61'),
('Canada', '+1');

create table tbl_user(
	user_id bigint primary key auto_increment,
    full_name varchar(256),
    user_name varchar(256),
    email_id varchar(256) unique,
    password_ varchar(256),
    code_id bigint references tbl_country_code(code_id),
    phone_number varchar(16) unique,
    latitude char(16),
    longitude char(16),
    profile_pic varchar(64) default "default.jpg",
    about text,
    is_login boolean default 0,	
    last_login datetime,
    is_step enum('0','1','2','3') default 0,
    is_profile_completed boolean default 0,
    is_active boolean default 1,
    is_deleted boolean default 0,
    created_at datetime default current_timestamp(),
    updated_at datetime on update current_timestamp()
);

SELECT u.user_id, u.full_name, u.email_id, d.device_type FROM tbl_user AS u LEft JOIN tbl_device_info AS d ON u.user_id = d.user_id WHERE u.user_id = ? AND u.is_active = 1 AND u.is_deleted = 0;

create table tbl_device_info(
	device_id bigint primary key auto_increment,
    device_type enum("Android", "IOS", "WebApp"),
    time_zone varchar(128),
    device_token varchar(60),
    os_version varchar(60),
    app_version varchar(60),
    user_id bigint references tbl_user(user_id),
    is_active boolean default 1,
	is_deleted boolean default 0,
	created_at datetime default current_timestamp(),
    updated_at datetime on update current_timestamp()
);

create table tbl_otp(
	otp_id bigint primary key auto_increment,
    user_id bigint references tbl_user(user_id),
    verify_with enum('m','e'),
    otp char(4),
    is_active boolean default 1,
    is_deleted boolean default 0,
    created_at datetime default current_timestamp(),
    updated_at datetime on update current_timestamp()
);
ALTER TABLE tbl_otp
ADD COLUMN expiry_time DATETIME DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 DAY);

select otp from tbl_otp where user_id = 1 and expiry_time > NOW();
select * from tbl_order;

ALTER TABLE tbl_admin CHANGE user_name admin_name VARCHAR(256);

select * from tbl_admin;

create table tbl_admin(
	admin_id int primary key auto_increment,
    admin_name varchar(256),
    email_id varchar(256) unique,
    password_ varchar(256),
    phone_number varchar(16) unique,
    profile_pic varchar(64) default "default.jpg",
    is_login boolean default 0,	
    last_login datetime,
    is_active boolean default 1,
    is_deleted boolean default 0,
    created_at datetime default current_timestamp(),
    updated_at datetime on update current_timestamp()
);

select * from tbl_admin;

INSERT INTO tbl_admin (
    admin_name,
    email_id,
    password_,
    phone_number,
    profile_pic,
    is_login,
    is_active,
    is_deleted
) VALUES (
    'SuperAdmin',
    'admin@example.com',
    '$2b$10$5YLSt3NhTskAhfsVAcx89Ozx67ZJoEN9HKkWOOa.Ex9b/.hQ.FmTa',
    '9876543210',
    DEFAULT,
    0,
    1,
    0
);

drop table tbl_admin;

select * from tbl_admin;

SELECT p.product_id, p.product_name, p.product_price, p.product_description, pi.image_name,c.category_name
                FROM tbl_products p
                left JOIN tbl_product_images pi ON p.product_id = pi.product_id
                left join tbl_category c on c.category_id = p.category_id
                WHERE p.product_id = 1;

create table tbl_products(
	product_id bigint primary key auto_increment,
    product_name varchar(256),
    product_price decimal(10,2),
    product_description text,
    is_deleted boolean default 0,
    created_at datetime default current_timestamp(),
    updated_at datetime on update current_timestamp()
);

select * from tbl_products;

create table tbl_category(
	category_id bigint primary key auto_increment,
    category_name varchar(256),
    is_deleted boolean default 0,
    created_at datetime default current_timestamp(),
    updated_at datetime on update current_timestamp()
);

SELECT p.product_id, p.product_name, p.product_price, pi.image_name,c.category_name
FROM tbl_products p
left JOIN tbl_product_images pi ON p.product_id = pi.product_id
left join tbl_category c on c.category_id = p.category_id;

alter table tbl_products add column category_id bigint references tbl_category(category_id);

select * from tbl_products;
select * from tbl_cart;
select * from tbl_order;

select p.product_name, p.product_price, p.product_description, c.qty
from 
tbl_cart c 
inner join tbl_products p 
on c.product_id = p.product_id 
inner join tbl_user u 
on u.user_id = c.user_id
where u.user_id = 11;

INSERT INTO tbl_category (category_name)
VALUES
('Smartphones'),
('Laptops'),
('Tablets'),
('Accessories'),
('Smartwatches'),
('Cameras'),
('Audio Devices'),
('Gaming Consoles');

INSERT INTO tbl_products (product_name, product_price, product_description, category_id)
VALUES
('Apple iPhone 14', 79999.00, 'Latest iPhone model with A15 Bionic chip and advanced camera features.', 1),
('Samsung Galaxy S22', 69999.00, 'Flagship Samsung smartphone with AMOLED display and powerful performance.', 2),
('OnePlus 11', 59999.00, 'Smooth performance with OxygenOS and high refresh rate display.', 3),
('Google Pixel 7', 64999.00, 'Clean Android experience with best-in-class camera.', 4),
('Redmi Note 12 Pro', 24999.00, 'Affordable smartphone with solid performance and great battery life.', 5);

INSERT INTO tbl_product_images (image_name, product_id)
VALUES
('iphone14_front.jpg', 1),
('iphone14_back.jpg', 1),
('galaxy_s22_front.jpg', 2),
('galaxy_s22_back.jpg', 2),
('oneplus11_main.jpg', 3),
('pixel7_camera.jpg', 4),
('redmi12pro_side.jpg', 5);


select * from tbl_product_images;

SELECT 
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
GROUP BY p.product_id, p.product_name, p.product_price, p.product_description, c.category_name, c.category_id;

select * from tbl_products;
create table tbl_product_images(
	img_id bigint primary key auto_increment,
    image_name varchar(128),
    product_id bigint references tbl_products(product_id),
    is_deleted boolean default 0,
    created_at datetime default current_timestamp(),
    updated_at datetime on update current_timestamp()
);

create table tbl_cart(
	cart_id bigint primary key auto_increment,
    user_id bigint references tbl_user(user_id),
    product_id bigint references tbl_products(product_id),
    qty bigint default 1,
    created_at datetime default current_timestamp(),
    updated_at datetime on update current_timestamp()
);

create table tbl_order(
	order_id bigint primary key auto_increment,
    order_num varchar(128),
    user_id bigint references tbl_user(user_id),
    sub_total decimal(10,2) default 0.00,
    shipping_charge decimal(10,2) default 0.00,
    grand_total decimal(10,2),
    status enum('pending', 'confirmed', 'failed') default 'pending',
    payment_type enum ('cod', 'debit', 'credit') default 'cod',
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

ALTER TABLE tbl_order 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'processed', 'shipped', 'completed', 'failed') DEFAULT 'pending';


alter table tbl_order add column address_id bigint references tbl_user_delivery_address(address_id);

create table tbl_order_details(
	order_detail_id bigint primary key auto_increment,
	order_id bigint references tbl_order(order_id),
    product_id bigint references tbl_products(product_id),
    qty bigint default 1,
    price bigint,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

create table tbl_user_delivery_address(
	address_id bigint primary key auto_increment,
    address_line text,
    city varchar(255),
    state varchar(255),
    pincode varchar(16),
    country varchar(256),
    user_id bigint references tbl_user(user_id),
    is_deleted boolean default 0,
    created_at datetime default current_timestamp(),
    updated_at datetime on update current_timestamp()
);

INSERT INTO tbl_user_delivery_address (address_line, city, state, pincode, country, user_id)
VALUES 
('22 Rose Villa, Marine Drive', 'Mumbai', 'Maharashtra', '400002', 'India', 11),
('404 Skyline Tower', 'Hyderabad', 'Telangana', '500081', 'India', 11),
('8/7 Elixir Garden', 'Chennai', 'Tamil Nadu', '600032', 'India', 11),
('C-90, Orbit Residency', 'Jaipur', 'Rajasthan', '302017', 'India', 11),
('Shanti Villa, Riverfront Road', 'Surat', 'Gujarat', '395003', 'India', 11);


select * from tbl_user_delivery_address;
select * from tbl_cart;
select * from tbl_products;
select * from tbl_order;
select * from tbl_user;
select * from tbl_category;

SELECT order_id, order_num, status, grand_total from tbl_order where order_id = 1;

select o.order_id, o.order_num, o.sub_total, 
o.shipping_charge, o.grand_total, o.status, o.payment_type, u.full_name,
u.email_id, u.profile_pic, u.user_id, da.address_line, da.city, da.state, da.pincode, da.country from tbl_order o left join 
tbl_user u on o.user_id = u.user_id 
left join tbl_user_delivery_address da 
on da.address_id = o.address_id where u.is_deleted = 0 and da.is_deleted = 0 LIMIT 1,10;

select u.full_name, u.email_id, u.code_id, u.phone_number, u.about
from tbl_user u left join tbl_order o on o.user_id = u.user_id where user_id = 2;

select * from tbl_admin;
select * from tbl_cart;
select address_id, address_line, city, state, pincode, country from tbl_user_delivery_address where user_id = 2 and is_deleted = 0;

SELECT p.product_id, p.product_name, p.product_price, p.product_description, pi.image_name,c.category_name FROM tbl_products p left JOIN tbl_product_images pi ON p.product_id = pi.product_id left join tbl_category c on c.category_id = p.category_id where p.product_id = 2;

select o.order_id, o.order_num, o.sub_total, 
o.shipping_charge, o.grand_total, 
o.status, o.payment_type, 
a.address_line, a.city, a.state, a.pincode, a.country
from tbl_order o inner join tbl_user_delivery_address a on a.address_id = o.address_id where o.user_id = 2;