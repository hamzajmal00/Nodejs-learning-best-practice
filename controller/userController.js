const {promisify} = require('util')
const User = require("../model/userModel");
const { catchAsync } = require("../utiles/CatchAsync");
var jwt = require("jsonwebtoken");
const sendEmail = require('../utiles/email');
const crypto = require('crypto');

exports.userSignUp = catchAsync(async (req, res, next) => {
  const { name, email,role, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name: name,
    email: email,
    role:role,
    password: password,
    passwordConfirm: passwordConfirm,
  });
  var token = jwt.sign({ id: newUser._id }, process.env.JWT_KEY, {
    expiresIn: "1h",
  });
  res.status(200).json({
    status: "success",
    token,
    user: newUser,
  });
  next();
});

exports.userSignIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if(!email || !password){
    next(new Error('please provide email and password', 401))
  }
  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password)
  if (!user || !correct) {
    return next(new Error('incorrect email or password' , 401))
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
    expiresIn: "1h",
  });
  res.status(200).json({
    status:'success',
    token:token
  })
  next()
});
exports.protect= catchAsync(async(req, res , next) => {
    let token;
   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
   }

   if(!token){
    return next(new Error('unauthorised'))
   }
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_KEY);
   const freshUser = await User.findById(decoded.id);
   if(!freshUser){
    return next(new Error('this user no long available'))
   }
req.user = freshUser;
next();
});

exports.restrictedTo = (...roles) => {
  return(req,res,next) => {
    if(!roles.includes(req.user.role)){
      return next(new Error('you donot have permissions'));
    }
    next();
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Error('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/user/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new Error('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new Error('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  // createSendToken(user, 200, res);
  res.send('password change successfuly');
});

