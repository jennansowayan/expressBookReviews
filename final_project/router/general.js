const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: `${username} successfully registred.`});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  
  if(req.params.isbn){
    var isbn = parseInt(req.params.isbn);
    var book = books[isbn];
    if(book){
      return res.status(200).send(JSON.stringify(book));
    }
    else{
      return res.status(401).json({message: "book not found"});
    }
    
  }
  else{
    return res.status(401).json({message: "invalid request"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let booksByAuthor = [];
    if(req.params.author){
    var author = req.params.author.replace("_"," ");
    var length = Object.keys(books).length
    for (let i = 1; i < length; i++) {      
      if(books[i].author == author){
        booksByAuthor.push(books[i]);
      }
    }

    if(booksByAuthor.length > 0){
      return res.status(200).send(booksByAuthor);
    }
    else{
        return res.status(404).json({message: "There are no books found by this author"});
    }
  }
  else{
    return res.status(401).json({message: "invalid request"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  if(req.params.title){
    var title = req.params.title, booksWithTitle = [];
    var length = Object.keys(books).length
    for (let i = 1; i < length; i++) {      
      if(books[i].title == title){
        booksWithTitle.push(books[i]);
      }
    }

    if(booksWithTitle.length > 0){
      return res.status(200).send(booksWithTitle);
    }
    else{
      return res.status(404).json({message: "There are no books found with this title"});
    }
  }
  else{
    return res.status(401).json({message: "invalid request"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  if(req.params.isbn){
    var isbn = parseInt(req.params.isbn),
    book = books[isbn],
    length = Object.keys(books).length

    if(book){
      if(length > 0)
      {      
        return res.status(200).send(JSON.stringify(book.reviews));
      }    
      else{
        return res.status(401).json({message: "there are no reviews on this book"});
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

module.exports.general = public_users;
