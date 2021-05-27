let BookInstance = require('../models/bookinstance');
let Book = require('../models/book');

const { body, validationResult } = require('express-validator');

// Display list of all BookInstances
exports.bookinstance_list = function (request, response, next) {
  // response.send('NOT IMPLEMENTED: BookInstance list');

  BookInstance.find()
    .populate('book')
    .exec(function (error, list_bookinstances) {
      if (error) {
        return next(error);
      }

      // Successful, so render
      response.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function (request, response, next) {
  //response.send('NOT IMPLEMENTED: BookInstance detail: ' + request.params.id);
  BookInstance.findById(request.params.id)
    .populate('book')
    .exec(function (error, bookinstance) {
      if (error) {
        return next(error);
      }
      if (bookinstance == null) {
        // No results
        let error = new Error('Book copy not found');
        error.status = 404;
        return next(error);
      }
      // Successful, so render
      response.render('bookinstance_detail', {
        title: 'Copy: ' + bookinstance.book.title,
        bookinstance: bookinstance,
      });
    });
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function (request, response, next) {
  //response.send('NOT IMPLEMENTED: BookInstance create GET');
  Book.find({}, 'title').exec(function (error, books) {
    if (error) {
      return next(error);
    }
    // Successful, so render
    response.render('bookinstance_form', {
      title: 'Create BookInstance',
      book_list: books,
    });
  });
};

// Handle BookInstance create on POST
/* exports.bookinstance_create_post = function (request, response) {
  response.send('NOT IMPLEMENTED: BookInstance create POST');
}; */
exports.bookinstance_create_post = [
  // Validate and sanitize fields
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status').escape(),
  body('due_back', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  (request, response, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(request);

    // Create a BookInstance object with escaped and trimmed data
    let bookinstance = new BookInstance({
      book: request.body.book,
      imprint: request.body.imprint,
      status: request.body.status,
      due_back: request.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages
      Book.find({}, 'title').exec(function (error, books) {
        if (error) {
          return next(error);
        }
        // Successful, so render
        response.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance,
        });
      });
      return;
    } else {
      // Data from form is valid
      bookinstance.save(function (error) {
        if (error) {
          return next(error);
        }
        // Successful - redirect to new record
        response.redirect(bookinstance.url);
      });
    }
  },
];

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function (request, response, next) {
  //response.send('NOT IMPLEMENTED: BookInstance delete GET');
  BookInstance.findById(request.params.id)
    .populate('book')
    .exec(function (error, bookinstance) {
      if (error) {
        return next(error);
      }
      if (bookinstance == null) {
        // No results
        response.redirect('/catalog/bookinstances');
      }
      // Successful, so render
      response.render('bookinstance_delete', {
        title: 'Copy: ' + bookinstance.book.title,
        bookinstance,
      });
    });
};

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = function (request, response) {
  response.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function (request, response) {
  response.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle BookInstance update on POST
exports.bookinstance_update_post = function (request, response) {
  response.send('NOT IMPLEMENTED: BookInstance update POST');
};
