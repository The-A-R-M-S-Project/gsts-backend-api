const jwt = require('jsonwebtoken');

class AuthController {
  constructor(User) {
    this.User = User;
  }

  signup() {
    return async (req, res, next) => {
      const user = await this.User.create(req.body);
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30m',
        issuer: 'gsts.cedat.mak.ac.ug'
      });
      res.status(201).json({
        message: `${user.role} successfully added!`,
        token,
        user
      });
    };
  }
}

module.exports = AuthController;
