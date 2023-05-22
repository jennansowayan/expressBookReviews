const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let user1 = users.filter((user)=>{
    return user.username === username
  });
  if(user1.length > 0){
    return true;
  } else {
    return false;
  }}

const authenticatedUser = (username,password)=>{ //returns boolean
  let authUser = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(authUser.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  
  if(req.params.isbn){
    var isbn = parseInt(req.params.isbn);
    var book = books[isbn];
    if(book){
      var username = req.session.authorization.username,
      review = req.body.review;
      book.reviews[username] = review
      return res.status(200).send(book.reviews);
    }
    else{
      return res.status(401).json({message: "book not found"});
    }
    
  }
  else{
    return res.status(401).json({message: "invalid request"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  
  if(req.params.isbn){
    var isbn = parseInt(req.params.isbn);
    var book = books[isbn];
    if(book){
      var username = req.session.authorization.username,
      review = req.body.review;
      if (book.reviews[username]){
        delete book.reviews[username]
        return res.status(200).send("review deleted");
      }
      else{
        return res.status(401).json({message: "you dont have a review on this book"});
      }
    }
    else{
      return res.status(401).json({message: "book not found"});
    }
    
  }
  else{
    return res.status(401).json({message: "invalid request"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
