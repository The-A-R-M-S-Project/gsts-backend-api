class AuthController {
  constructor(User) {
    this.User = User;
  }

  signup() {
    return async (req, res, next) => {
      const user = await this.User.create(req.body);
      res
        .status(201)
        .json({ user, message: `${user.role} successfully added!` });
    };
  }
}

module.exports = AuthController;
