const express = require("express");
const { userSignUp, userSignIn, resetPassword, forgotPassword } = require("../controller/userController");
const router = express.Router();


router.route("/signup").post(userSignUp)
router.route("/signin").post(userSignIn)
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token',resetPassword);



module.exports = router;