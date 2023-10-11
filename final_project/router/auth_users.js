const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const bcrypt = require("bcrypt")

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    const getUsername = Object.values(users).filter(val => {
        return val.username == username
    })
    if (getUsername.length > 0){
        return true
    }
    return false
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", async (req,res) => {
  //Write your code here
  try{
    const { username, password } = req.body;
    if(!username || !password){
        return res
        .status(400)
        .json({message: "username and password is required"})
    }
    if(!isValid(username)){
        return res
        .status(400)
        .json({message: "invalid credentials"})
    }
    const getUserDetails = Object.values(users).filter(val => {
        return val.username === username
    })
    const passwordCheck = await bcrypt.compare(password, getUserDetails[0].password);
    if(!passwordCheck){
        return res
        .status(401)
        .json({message: "invalid credentials"})
    }
    const token = jwt.sign({data: username}, "token_secret_should_come_from_env_file", {expiresIn: 60*60});
    req.session.authorization = {
        token, username
    }
    return res
    .status(200)
    .json({message: "logged is successfully!"});

  }catch(error){
    return res
    .status(500)
    .json({message: "something went wrong", err: error.message});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
  //Write your code here
  try{
    const review = req.query.review;
    const isbn = parseInt(req.params.isbn)
    if(!books[isbn]){
        return res
        .status(400)
        .json({message: "book with ISBN does not exist"})
    }
    const allReviews = books[isbn].reviews;
    if(!books[isbn].reviews[req.session.authorization.username]){
        allReviews[req.session.authorization.username] = review
    }
    return res
    .status(200)
    .json({message: "review added or modified successfully!", data: books[isbn]})
  }catch(error){
    return res
    .status(500)
    .json({message: "something went wrong", err: error.message});   
  }
});

// delete book review
regd_users.delete("/auth/review/:isbn", async (req, res) => {
  //Write your code here
  try{
    const isbn = parseInt(req.params.isbn)
    if(!books[isbn]){
        return res
        .status(400)
        .json({message: "book with ISBN does not exist"})
    }
    const allReviews = books[isbn].reviews;
    if(!allReviews[req.session.authorization.username]){
        return res
        .status(400)
        .json({message: "you have not added any review, nothing to delete"})
    }
    delete allReviews[req.session.authorization.username]
    return res
    .status(200)
    .json({message: "review deleted!", data: books[isbn]})
  }catch(error){
    return res
    .status(500)
    .json({message: "something went wrong", err: error.message});   
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
