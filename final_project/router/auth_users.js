const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Array to store registered users
const secretKey = "your_secret_key"; // Replace with your actual secret key

const isValid = (username) => {
  // Check if the username exists in the users array
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Check if the username and password match
  const user = users.find((user) => user.username === username);
  return user && user.password === password;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Check if the username and password match
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate a JWT token
  const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

  // Return a success message along with the token
  res.status(200).json({ message: "Customer successfully logged in!", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Get the review from the query parameter
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1]; // Get the token from the header

  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token." });
    }

    const username = decoded.username; // Get the username from the decoded token

    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }

    // Initialize the reviews object if it doesn't exist
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    // If the user already has a review for this book, modify it; otherwise, add it as a new review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
      message: `The review for the book with ISBN: ${isbn} has been added/updated`,
      reviews: books[isbn].reviews,
    });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
