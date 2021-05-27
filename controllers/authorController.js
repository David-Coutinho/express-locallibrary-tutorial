const Author = require('../models/author');
let Book = require('../models/book');
let async = require('async');

const { body, validationResult } = require('express-validator');

// Display list of all Authors
exports.author_list = function (request, response, next) {
  //response.send('NOT IMPLEMENTED: Author list');

  Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function (error, list_authors) {
      if (error) {
        return next(error);
      }

      // Successful, so render
      response.render('author_list', {
        title: 'Author List',
        author_list: list_authors,
      });
    });
};

// Display detail page for a specific Author
exports.author_detail = function (request, response, next) {
  //response.send('NOT IMPLEMENTED: Author detail: ' + request.params.id);
  async.parallel(
    {
      author: function (callback) {
        Author.findById(request.params.id).exec(callback);
      },
      authors_books: function (callback) {
        Book.find({ author: request.params.id }, 'title summary').exec(
          callback
        );
      },
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      if (results.author == null) {
        // No results
        let error = new Error('Author not found');
        error.status = 404;
        return next(error);
      }
      // Successful, so render
      response.render('author_detail', {
        title: 'Author Detail',
        author: results.author,
        author_books: results.authors_books,
      });
    }
  );
};

// Display Author create form on GET
exports.author_create_get = function (request, response, next) {
  //response.send('NOT IMPLEMENTED: Author create GET');
  response.render('author_form', {
    title: 'Create Author',
  });
};

// Handle Author create on POST
/* exports.author_create_post = function (request, response) {
  response.send('NOT IMPLEMENTED: Author create POST');
}; */
exports.author_create_post = [
  // Validate and sanitize fields
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  (request, response, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages
      response.render('author_form', {
        title: 'Create Author',
        author: request.body,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid

      // Create an Author object with escaped and trimmed data
      let author = new Author({
        first_name: request.body.first_name,
        family_name: request.body.family_name,
        date_of_birth: request.body.date_of_birth,
        date_of_death: request.body.date_of_death,
      });
      author.save(function (error) {
        if (error) {
          return next(error);
        }
        // Successful - redirect to new author record
        response.redirect(author.url);
      });
    }
  },
];

// Display Author delete form on GET
exports.author_delete_get = function (request, response, next) {
  //response.send('NOT IMPLEMENTED: Author delete GET');
  async.parallel(
    {
      author: function (callback) {
        Author.findById(request.params.id).exec(callback);
      },
      authors_books: function (callback) {
        Book.find({ author: request.params.id }).exec(callback);
      },
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      if (results.author === null) {
        // No results
        response.redirect('/catalog/authors');
      }
      // Successful, so render
      response.render('author_delete', {
        title: 'Delete Author',
        author: results.author,
        author_books: results.authors_books,
      });
    }
  );
};

// Handle Author delete on POST
exports.author_delete_post = function (request, response, next) {
  //response.send('NOT IMPLEMENTED: Author delete POST');
  async.parallel(
    {
      author: function (callback) {
        Author.findById(request.body.authorid).exec(callback);
      },
      authors_books: function (callback) {
        Book.find({ author: request.body.authorid }).exec(callback);
      },
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      // Success
      if (results.authors_books.length > 0) {
        // Author has books. Render in same way as for GET route
        response.render('author_delete', {
          title: 'Delete Author',
          author: results.author,
          author_books: results.authors_books,
        });
        return;
      } else {
        // Author has no books. Delete object and redirect to the list of authors
        Author.findByIdAndRemove(
          request.body.authorid,
          function deleteAuthor(error) {
            if (error) {
              return next(error);
            }
            // Success - go to author list
            response.redirect('/catalog/authors');
          }
        );
      }
    }
  );
};

// Display Author update form on GET
exports.author_update_get = function (request, response) {
  response.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST
exports.author_update_post = function (request, response) {
  response.send('NOT IMPLEMENTED: Author update POST');
};
