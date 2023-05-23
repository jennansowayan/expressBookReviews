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

function getBookList() {
  return new Promise((resolve) => {
    resolve(JSON.stringify(books)); 
  });
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try{
    const list = await getBookList();
    res.send(list);

  }
  catch(err){
    res.status(404).send(err)
  }
});

function getBookByIsbn(isbn) {
  return new Promise((resolve, reject) => {
    if(isbn){
      var isbn = parseInt(isbn);
      var book = books[isbn];
      if(book){
        resolve(JSON.stringify(book));
      }
      else{
        reject("book not found");
      }
      
    }
    else{
      reject("invalid request");
    }

  });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try{
    const book = await getBookByIsbn(req.params.isbn);
    res.send(book)
  }
  catch(err){
    res.status(404).send(err)
  }
  
 });
  
 function getBooksByAuthor(author) {
    return new Promise ((resolve, reject) => {
      let booksByAuthor = [];
      if(author){
      var author = author.replace("_"," ");
      var length = Object.keys(books).length
      for (let i = 1; i < length; i++) {      
        if(books[i].author == author){
          booksByAuthor.push(books[i]);
        }
      }
  
      if(booksByAuthor.length > 0){
        resolve(booksByAuthor);
      }
      else{
          reject("There are no books found by this author");
      }
    }
    else{
      reject("invalid request");
    }
    });
 }
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const booksByAuthor = await getBooksByAuthor(req.params.author);
  res.send(booksByAuthor);
});

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    if(title){
      var booksWithTitle = [],
      length = Object.keys(books).length
      for (let i = 1; i < length; i++) {      
        if(books[i].title == title){
          booksWithTitle.push(books[i]);
        }
      }
  
      if(booksWithTitle.length > 0){
        resolve(booksWithTitle);
      }
      else{
        reject("There are no books found with this title");
      }
    }
    else{
      reject("invalid request");
    }
  });
}

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try{
    const booksWithTitle = await getBooksByTitle(req.params.title);
  res.send(booksWithTitle);
  }
  catch(err){
    res.status(404).send(err)
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
