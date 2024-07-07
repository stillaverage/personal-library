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
      try {
        const book = await Book.findById(bookid)
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        })
      } catch (err) {
        res.json('no book exists')
      }
    })
    
    .post(async function (req, res){
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        res.json('missing required field comment')
      } else {
        try {
          const updatedBook = await Book.findById(bookid)
          updatedBook.comments.push(comment)
          await updatedBook.save()
          res.json({
            _id: updatedBook._id,
            title: updatedBook.title,
            comments: updatedBook.comments
          })
        } catch (err) {
          res.json('no book exists')
        }
      }
    })
    
    .delete(async function (req, res){
      const bookid = req.params.id;
      try {
        const deletedBook = await Book.findByIdAndDelete(bookid)
        if (!deletedBook) {
          res.json('no book exists')
        } else {
          //if successful response will be 'delete successful'
          res.json('delete successful')
        }
      } catch (err) {
        res.json('no book exists')
      }
    });
  
};
