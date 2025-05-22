const express = require("express");
const { Op } = require("sequelize");
const { User } = require("./db");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = 3000;

// Middlewares
async function userAvailable(req, res, next) {
  const { username } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  req.user = user;
  next();
}
function userRoleAuthentication(roles = []) {
  return (req, res, next) => {
    if (!roles.length || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ error: "Unauthorized role" });
  };
}


// Login

app.post("/api/v1/login", [userAvailable], async (req, res) => {
  const { password } = req.body;
  if (req.user.password !== password) {
    return res.status(401).json({ error: "Invalid password" });
  }
  res.json({ message: "Login successful", user: req.user });
});

// Register

app.post("/api/v1/register", async (req, res) => {
  const { username, display_name, password, dob, pp_url } = req.body;
  try {
    const exists = await User.findOne({ where: { username } });
    if (exists) return res.status(400).json({ error: "Username already taken" });
    const user = await User.create({ username, display_name, password, dob, role:"customer", pp_url });
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});



app.listen(port, function () {
  console.log(`listening on port:${port}...`);
});
