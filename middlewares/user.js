const { body } = require('express-validator/check');

module.exports= (req, res, next) => {
    let val=body('email').isEmail().withMessage('Enter a valid email address').custom((value, { req, res, next }) => {
        User.findOne({ email: value }).then(user => {
            if (user) {
                return Promise.reject('User already exists');
            }
        })
    }).normalizeEmail();
    console.log(val);
    next();
    
}

// exports.name = (req, res, next) => {
//     body('name').trim().not().isEmpty()
// }

// exports.username = (req, res, next) => {
//     body('username').trim().not().isEmpty()
// }

// exports.password = (req, res, next) => {
//     body('password').trim().isLength({ min: 6 })
// }