const User = require('../model/User');
const jwt = require('jsonwebtoken');    

const token = createToken = (user) => {
  return jwt.sign({ id: user._id, first_name: user.first_name, last_name: user.last_name,provider:user.provider }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.registerUser = async (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;

    // Validate required fields
  if (!first_name || !last_name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

    // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate phone number format (example: 10 digits)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
      const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const user = await User.create({ first_name, last_name, email, phone, password });
    const token = createToken(user);
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.googleCallback = (req, res) => {
    console.log("Google callback triggered",req.user);
    try {
        const token = createToken(req.user);
    // Successful authentication, user information is available in req.user
        const viewUser = { user: req.user, token };
        console.log("Generated token:", token);
        res.redirect(`http://localhost:8080/dashboard?token=${ token }`);
    console.log(`welcome ${req.user.first_name}!`);    // Redirect to a dashboard or home page after successful login
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const token = createToken(user);
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}