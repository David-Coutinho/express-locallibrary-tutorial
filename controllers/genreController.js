var Genre = require('../models/genre');
let Book = require('../models/book');
let async = require('async');

const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = function (request, response, next) {
  //res.send('NOT IMPLEMENTED: Genre list');
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (error, list_genres) {
      if (error) {
        return next(error);
      }

      // Successful, so render
      response.render('genre_list', {
        title: 'Genre List',
        genre_list: list_genres,
      });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (request, response, next) {
  //res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(request.params.id).exec(callback);
      },
      genre_books: function (callback) {
        Book.find({ genre: request.params.id }).exec(callback);
      },
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      if (results.genre == null) {
        // No results.
        let error = new Error('Genre not found');
        error.status = 404;
        return next(error);
      }
      // Successful, so render
      response.render('genre_detail', {
        title: 'Genre Detail',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = function (request, response, next) {
  //res.send('NOT IMPLEMENTED: Genre create GET');
  response.render('genre_form', {
    title: 'Create Genre',
  });
};

// Handle Genre create on POST.
/* exports.genre_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre create POST');
}; */
exports.genre_create_post = [
  // Validate and sanitize the name field
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization
  (request, response, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(request);

    // Create a genre object with escaped and trimmed data
    let genre = new Genre({ name: request.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages
      response.render('genre_form', {
        title: 'Create Genre',
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      // Check if Genre with same name already exists
      Genre.findOne({ name: request.body.name }).exec(function (
        error,
        found_genre
      ) {
        if (error) {
          return next(error);
        }
        if (found_genre) {
          // Genre exists, redirect to its detail page
          response.redirect(found_genre.url);
        } else {
          genre.save(function (error) {
            if (error) {
              return next(error);
            }
            // Genre saved. Redirect to genre detail page
            response.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update POST');
};
