var Book = require('../models/book');
let Author = require('../models/author');
let Genre = require('../models/genre');
let BookInstance = require('../models/bookinstance');

let async = require('async');

const { body, validationResult } = require('express-validator');

exports.index = function (request, response, next) {
  async.parallel(
    {
      book_count: function (callback) {
        Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      book_instance_count: function (callback) {
        BookInstance.countDocuments({}, callback);
      },
      book_instance_available_count: function (callback) {
        BookInstance.countDocuments({ status: 'Available' }, callback);
      },
      author_count: function (callback) {
        Author.countDocuments({}, callback);
      },
      genre_count: function (callback) {
        Genre.countDocuments({}, callback);
      },
    },
    function (error, results) {
      response.render('index', {
        title: 'Local Library Home',
        error,
        data: results,
      });
    }
  );
  //res.send('NOT IMPLEMENTED: Site Home Page');
};

// Display list of all books.
exports.book_list = function (request, response, next) {
  Book.find({}, 'title author')
    .populate('author')
    .exec(function (error, list_books) {
      if (error) {
        return next(error);
      }
      // Successful, so render
      response.render('book_list', {
        title: 'Book List',
        book_list: list_books,
      });
    });
  //response.send('NOT IMPLEMENTED: Book list');
};

// Display detail page for a specific book.
exports.book_detail = function (request, response, next) {
  // res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
  async.parallel(
    {
      book: function (callback) {
        Book.findById(request.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },
      book_instance: function (callback) {
        BookInstance.find({ book: request.params.id }).exec(callback);
      },
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      if (results.book == null) {
        // No results.
        let error = new Error('Book not found');
        error.status = 404;
        return next(error);
      }
      // Successful, so render
      response.render('book_detail', {
        title: results.book.title,
        book: results.book,
        book_instances: results.book_instance,
      });
    }
  );
};

// Display book create form on GET.
exports.book_create_get = function (request, response, next) {
  //res.send('NOT IMPLEMENTED: Book create GET');

  // Get all authors and genres, which we can use for adding to our book
  async.parallel(
    {
      authors: function (callback) {
        Author.find(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      },
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      response.render('book_form', {
        title: 'Create Book',
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

// Handle book create on POST.
/* exports.book_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book create POST');
}; */
exports.book_create_post = [
  // Convert the genre to an array
  (request, response, next) => {
    if (!(request.body.genre instanceof Array)) {
      if (typeof request.body.genre === 'undefined') {
        request.body.genre = [];
      } else {
        request.body.genre = new Array(request.body.genre);
      }
    }
    next();
  },

  // Validate and sanitize fields
  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('summary', 'Summary must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  // Process request after validation and sanitization
  (request, response, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(request);

    // Create a Bok object with escaped and trimmed data
    let book = new Book({
      title: request.body.title,
      author: request.body.author,
      summary: request.body.summary,
      isbn: request.body.isbn,
      genre: request.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages

      // Get all authors and genres for form
      async.parallel(
        {
          authors: function (callback) {
            Author.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        function (error, results) {
          if (error) {
            return next(error);
          }

          // Mark our selected genres as checked
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = 'true';
            }
          }
          response.render('book_form', {
            title: 'Create Book',
            authors: results.authors,
            genres: results.genres,
            book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save book
      book.save(function (error) {
        if (error) {
          return next(error);
        }
        // Successful - redirect to new book record
        response.redirect(book.url);
      });
    }
  },
];

// Display book delete form on GET.
exports.book_delete_get = function (request, response, next) {
  //res.send('NOT IMPLEMENTED: Book delete GET');
  async.parallel(
    {
      book: function (callback) {
        Book.findById(request.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },
      book_instance: function (callback) {
        BookInstance.find({ book: request.params.id }).exec(callback);
      },
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      if (results.book === null) {
        // No results
        response.redirect('/catalog/books');
      }
      // Successful, so render
      response.render('book_delete', {
        title: 'Delete Book',
        book: results.book,
        book_instances: results.book_instance,
      });
    }
  );
};

// Handle book delete on POST.
exports.book_delete_post = function (request, response, next) {
  response.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function (request, response, next) {
  //res.send('NOT IMPLEMENTED: Book update GET');

  // Get book, authors and genres for form
  async.parallel(
    {
      book: function (callback) {
        Book.find(request.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },
      authors: function (callback) {
        Author.find(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      },
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      if (results.book == null) {
        // No results
        let error = new Error('Book not found');
        error.status = 404;
        return next(error);
      }
      // Success
      // Mark our selected genres as checked
      for (
        let all_g_iter = 0;
        all_g_iter < results.genres.length;
        all_g_iter++
      ) {
        for (
          let book_g_iter = 0;
          book_g_iter < results.book.genre.length;
          book_g_iter++
        ) {
          if (
            results.genres[all_g_iter]._id.toString() ===
            results.book.genre[book_g_iter]._id.toString()
          ) {
            results.genres[all_g_iter].checked = 'true';
          }
        }
      }
      response.render('book_form', {
        title: 'Update Book',
        authors: results.authors,
        genres: results.genres,
        book: results.book,
      });
    }
  );
};

// Handle book update on POST.
/* exports.book_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update POST');
}; */
exports.books_update_post = [
  // Convert the genre to an array
  (request, response, next) => {
    if (!(request.body.genre instanceof Array)) {
      if (typeof request.body.genre === 'undefined') {
        request.body.genre = [];
      } else {
        request.body.genre = new Array(request.body.genre);
      }
    }
    next();
  },

  // Validate and sanitize fields
  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('summary', 'Summary must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  // Process request after validation and sanitization
  (request, response, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(request);

    // Create a Book object with escaped/trimmed data and old id
    let book = new Book({
      title: request.body.title,
      author: request.body.author,
      summary: request.body.summary,
      isbn: request.body.isbn,
      genre:
        typeof request.body.genre === 'undefined' ? [] : request.body.genre,
      _id: request.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages

      // Get all authors and genres for form
      async.parallel(
        {
          authors: function (callback) {
            Author.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        function (error, results) {
          if (error) {
            return next(error);
          }

          // Mark our selected genres as checked
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]) > -1) {
              results.genres[i].checked = 'true';
            }
          }
          response.render('book_form', {
            title: 'Update Book',
            authors: results.authors,
            genres: results.genres,
            book,
            errors: errors.array(),
          });
          return;
        }
      );
    } else {
      // Data from form is valid. Update the record
      Book.findByIdAndUpdate(
        request.params.id,
        book,
        {},
        function (error, thebook) {
          if (error) {
            return next(error);
          }
          // Successful - redirect to book detail page
          response.redirect(thebook.url);
        }
      );
    }
  },
];
