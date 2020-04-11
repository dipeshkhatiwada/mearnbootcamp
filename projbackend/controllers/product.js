const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
    Product.findById(id)
        .populate("category")
        .exec((err, product) => {
            if (err) {
                return res.status(400).json({
                    error: "Product not found"
                });
            }
            req.product = product
            next();

        })
};

exports.createProduct = (req, res) => {
    let form = formidable.IncomingForm();
    form.keepExtension = true;

    form.parse(req, (err, fields, file) => {
        if (err) {
            res.status(400).json({
                error: "problem with image"
            })
        }
        // destructure the fields
        const {
            name,
            description,
            price,
            category,
            stock,
        } = fields;

        if (!name || !description || !price || !category || !stock) {
            res.status(400).json({
                error: "All Fields are required"
            })
        }

        // TODO : restriction on field

        let product = new Product(fields)

        // handling file!!
        if (file.photo) {
            if (file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "file size is big"
                });
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type
        }

        // save to DB
        product.save((err, product) => {
            if (err) {
                res.status(400).json({
                    error: "Product save Failed"
                });
            }
            res.json(product);
        })
    });
};

exports.getProduct = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
};

// MIDDLEWARE
exports.photo = (req, res, next) => {
    if (req.product.photo.data) {
        res.set("Content-Type", req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
};

exports.updateProduct = (req, res) => {
    let form = formidable.IncomingForm();
    form.keepExtension = true;

    form.parse(req, (err, fields, file) => {
        if (err) {
            res.status(400).json({
                error: "problem with image"
            })
        }

        // updation code
        let product = req.product;
        product = _.extend(product, fields)

        // handling file!!
        if (file.photo) {
            if (file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "file size is big"
                });
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type
        }

        // save to DB
        product.save((err, product) => {
            if (err) {
                res.status(400).json({
                    error: "Product updated Failed"
                });
            }
            res.json(product);
        })
    });
};

exports.removeProduct = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: "Product failed to delete",
            });
        }
        return res.json({
            message: "Successfully deleted",
            deletedProduct
        })
    })

};

// LISTING ROUTES
exports.getAllProducts = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 8;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

    Product.find()
        .select("-photo")
        .populate("catregory")
        .sort([
            [sortBy, "asc"]
        ])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Product not fount in DB",
                });
            }
            res.json(products)
        })
}

exports.getAllUniqueCategories = (req, res) => {
    Product.distinct("category", {}, (err, category) => {
        if (err) {
            return res.status(400).json({
                error: "Category not fount in DB",
            });
        }
        res.json(category);
    })
}

// MIDDLEWARE
exports.updateStock = (req, res, next) => {
    // map() helps in LOOPING
    let myOperations = req.body.order.products.map(prod => {
        return {
            updateOne: {
                filter: {
                    _id: prod._id
                },
                update: {
                    $inc: {
                        stock: -prod.count,
                        sold: +prod.count
                    }
                }
            }
        }
    })

    Product.bulkWrite(myOperations, {}, (err, products) => {
        if (err) {
            return res.status(400).json({
                error: "Bulk operation failed"
            })
        }
        next();
    })
};