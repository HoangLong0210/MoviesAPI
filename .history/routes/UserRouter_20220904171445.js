const auth = require("../middleware/Auth");
const encrypt = require("../middleware/Encrypt");
const User = require("../modules/User");

const router = express.Router();

router.post("/users/login", async (req, res) => {
  //Login a registered user
  try {
    const { username, password } = req.body;
    const user = await User.findByCredentials(email, password); //tìm user trong dâtbase
    if (!user) {
      return res
        .status(401)
        .send({ error: "Login failed! Check authentication credentials" });
    }
    const token = await User.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users", async (req, res) => {
  // Create a new user
  try {
    const user = new User(req.body);
    await user.save();
    const token = await User.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/me/logout", auth, async (req, res) => {
  // Log user out of the application
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
