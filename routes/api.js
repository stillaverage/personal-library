/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose');
mongoose.connect(process.env.DB)

let bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  comments: Array
}, { versionKey: false })

let Book = mongoose.model('Book', bookSchema)

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let listAllBooks = await Book.find({}, { comments: 0 }).lean()
      let listAllComments = await Book.find({}, { comments: 1 })
      listAllBooks.forEach((element, index) => {
        listAllComments.forEach((comments, index) => {
          if (String(element._id) === String(comments._id)) {
            element.commentcount = comments.comments.length
          }
        })
      })
      res.json(listAllBooks)
    })
    
    .post(async function (req, res){
      const title = req.body.title;
      if (!title)  {
        res.json('missing required field title')
      } else {
        //response will contain new book object including atleast _id and title
        let comments = [];
        const newBook = await Book.create({ title, comments })
        const _id = newBook._id
        res.json({ _id, title })
      }
    })
    
    .delete(async function (req, res){
      const deletedBooks = await Book.deleteMany({})
      //if successful response will be 'complete delete successful'
      res.json('complete delete successful')
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      const bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const book = await Book.findById(bookid)
      if (book) {
        res.json(book)
      } else {
        res.json('no book exists')
      }
    })
    
    .post(async function (req, res){
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        res.json('missing required field comment')
      } else {
        const comments = await Book.findById(bookid, { comments: 1 })
        if (comments) {
          const updatedBook = await Book.findByIdAndUpdate(bookid, { comments: [...comments.comments, comment] }, { returnDocument: 'after' })
          //json res format same as .get
          res.json(updatedBook)
        } else {
          res.json('no book exists')
        }
      }
    })
    
    .delete(async function (req, res){
      const bookid = req.params.id;
      const deletedBook = await Book.findByIdAndDelete(bookid)
      if (deletedBook) {
        //if successful response will be 'delete successful'
        res.json('delete successful')
      } else {
        res.json('no book exists')
      }
    });
  
};
