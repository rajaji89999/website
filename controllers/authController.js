const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');
const { ONE_DAY_IN_MS } = require('../utils/constants');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * ONE_DAY_IN_MS
    ),
    secure: false, //It make sure that cookie will only be sent on secure(HTTPS) connection.
    httpOnly: true, // It make sure that cookie is not changed by the browser.
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt, role } =
    req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt: passwordChangedAt || new Date(),
    // role, // We will add this field manually for the admins. By default, We will create users only.
  });

  delete newUser['password']; // Removing password field from response

  createSendToken(newUser, '201', res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //  1. Check if email and password is exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  //  2. Check if the user exists and the password is correct.
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //  3. If Everything OK, then send the token to the client.
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token and check if it's there.
  let token;
  const authorization = req.headers.authorization;

  if (
    authorization &&
    authorization.startsWith('Bearer') &&
    authorization?.split(' ')[1] !== 'null'
  ) {
    token = authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access.', 401)
    );
  }

  // 2. Verifying Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Checking if the user exists.
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exist.', 401)
    );
  }

  // 4. Check if user changed the password after token was issued.
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Send currentUser in all request.
  req.user = currentUser;

  // Grant Access to protected route
  next();
});

exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req?.cookies?.jwt) {
    try {
      let token = req.cookies.jwt;

      // 1. Verify Token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);

      // 2. Check if user still exists
      if (!currentUser) {
        return next();
      }

      // THERE IS A LOGGED USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  return next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action.", 403)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get User By Email
  const email = req.body.email;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError(`There is no user with this email address.`, 404));
  }

  // 2. Generate Random Reset Token
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user by email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Hi ${user.name},\n\nThere was a request to change your password!\n\nIf you did not make this request then please ignore this email.\n\nOtherwise, please click this link to change your password:\n\n${resetURL}\n
  `;

  const options = {
    email: user.email,
    subject: 'Your password reset token (vaild for 10 min)',
    message,
  };

  try {
    await sendEmail(options);

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error ending the email. Try again later!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token
  const paramsToken = req.params.token;
  const hashedToken = crypto
    .createHash('sha256')
    .update(paramsToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  // 2. If token not has expired and there is user, set the new password.
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  // 3. Update changedPasseordAt property for the current user.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4. Log the user in, send the JWT token.
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const currentPassword = req.body.currentPassword;
  const updatedPassword = req.body.updatedPassword;
  const confirmUpdatedPassword = req.body.confirmUpdatedPassword;

  // 1. Checking if the user exists.
  const currentUser = await User.findById(req.user.id).select('+password');

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exist.', 401)
    );
  }

  // 2. Check if posted current password is correct.
  if (
    !(await currentUser.correctPassword(currentPassword, currentUser.password))
  ) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // 3. if so, change the password
  currentUser.password = updatedPassword;
  currentUser.passwordConfirm = confirmUpdatedPassword;
  await currentUser.save();

  // 6. Log in user, send JWT.
  createSendToken(currentUser, 200, res);
});
