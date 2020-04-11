const {
    Order,
    ProductCart
} = require("../models/order");

exports.getOrderById = (req, res, next, id) => {
    Order.findById(id)
        .populate("products.product", "name price")
        .exec((err, order) => {
            if (err) {
                return res.status(400).json({
                    error: "Orders not fount ",
                });
            }
            req.order = order;
            next();
        })
};

exports.createOrder = (req, res) => {
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    order.save((err, order) => {
        if (err) {
            return res.status(400).json({
                error: "Orders failed to save ",
            });
        }
        return res.json(order);
    })
};

exports.getAllOrders = (req, res) => {
    Order.find()
        .populate("user", "_id name email")
        .exec((err, order) => {
            if (err) {
                return res.status(400).json({
                    error: "Orders not found ",
                });
            }
            return res.json(order);

        });
};

// STAUTS

exports.getOrderStatus = (req, res) => {
    res.json(Order.schema.path("status").enumValues);

}
exports.updateStatus = (req, res) => {
    Order.update({
            _id: req.body.orderId
        }, {
            $ser: {
                status: req.body.status
            }
        },
        (err, order) => {
            if (err) {
                return res.status(400).json({
                    error: "Orders status update failed ",
                });
            }
            res.json(order);
        }
    );
};