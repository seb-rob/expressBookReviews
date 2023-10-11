const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const bcrypt = require("bcrypt")


public_users.post("/register", async (req,res) => {
  //Write your code here
  try {
    const { username, password } = req.body;
    if(!username || !password){
        return res.status(400).json({message: "username and password are required field"})
    }
    const usernameExist = Object.values(users).filter(val => {
        return val.username === username
    })
    if(usernameExist.length > 0){
      return res.status(400).json({message: "username already exist"})
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    users.push({username, password: hashedPassword})
    return res.status(200).json({message: "registration successful!"})
  } catch (error) {
      return res.status(500).json({message: "something went wrong", err: error.message})
  }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  try{
    if (books.length == 0){
        return res
        .status(200)
        .json({message: "currently there is no book to view"})
    }
    return res.send(JSON.stringify(books, null, 5))

  }catch(error){
    return res
    .status(500)
    .json({message: "something went wrong", err: error.message})
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  try{
    const isbn = req.params.isbn;
    if(!books[isbn]){
        return res
        .status(400)
        .json({message: "book with isbn does not exists"});
    }
    return res.send(JSON.stringify(books[isbn]))

  }catch(error){
    return res
    .status(500)
    .json({message: "something went wrong", err: error.message})
  }
  
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  try{
    const author = req.params.author.toLowerCase();
    const bookByAuthor = Object.values(books).filter(val => {
        return val.author.toLowerCase() === author
    })
    if(bookByAuthor.length == 0){
        return res
        .status(400)
        .json({message: "no book available with given author name"})
    }
    return res.send(JSON.stringify(bookByAuthor, null, 5))
  }catch(error){
    return res
    .status(500)
    .json({message: "something went wrong", err: error.message})
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  try{
    const title = req.params.title.toLowerCase();
    const bookByTitle = Object.values(books).filter(val => {
        return val.title.toLowerCase() === title
    })
    if(bookByTitle.length == 0){
        return res.status(400).json({message: "there is no book available with the given title"})
    }
    return res.send(JSON.stringify(bookByTitle, null, 5))
  }catch(error){
    return res
    .status(500)
    .json({message: "something went wrong", err: error.message})
  }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  //Write your code here
  try{
    const isbn = parseInt(req.params.isbn)
    if(!books[isbn]){
        return res.status(400).json({message: "invalid isbn number"})
    }
    return res.send(JSON.stringify(books[isbn].reviews))
  }catch(error){
    return res
    .status(500)
    .json({message: "something went wrong", err: error.message})
  }
});

module.exports.general = public_users;
