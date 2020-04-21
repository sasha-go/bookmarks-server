const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const logger = require('../logger')
const BookarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating),
})

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    BookarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    for (const field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`'${field}' is required`)
      }
    }

    const { title, url, description, rating } = req.body

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating '${rating}' supplied`)
      return res.status(400).send(`'rating' must be a number between 0 and 5`)
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`)
      return res.status(400).send(`'url' must be a valid URL`)
    }

    const newBookmark = { title, url, description, rating }

    BookarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        logger.info(`Card with id ${bookmark.id} created.`)
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark))
      })
      .catch(next)
  })

bookmarksRouter
  .route('/bookmarks/:bookmark_id')
  .all((req, res, next) => {
    const { bookmark_id } = req.params
    BookarksService.getById(req.app.get('db'), bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${bookmark_id} not found.`)
          return res.status(404).json({
            error: { message: `Bookmark Not Found` }
          })
        }
        res.bookmark = bookmark
        next()
      })
      .catch(next)

  })
  .get((req, res) => {
    res.json(serializeBookmark(res.bookmark))
  })
  .delete((req, res, next) => {
    // TODO: update to use db
    const { bookmark_id } = req.params
    BookarksService.deleteBookmark(
      req.app.get('db'),
      bookmark_id
    )
      .then(numRowsAffected => {
        logger.info(`Card with id ${bookmark_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = bookmarksRouter;






// const express = require("express");
// const uuid = require("uuid/v4");
// const logger = require("../logger");
// const store = require("../../store");

// const bookmarksRouter = express.Router();
// const bodyParser = express.json();

// // Bookmarks Router
// bookmarksRouter
//   .route("/bookmarks")

//   // GET
//   .get((req, res) => {
//     res.json(store.bookmarks);
//   })

//   //POST
//   .post(bodyParser, (req, res) => {
//     for (const field of ["title", "url", "rating"]) {
//       if (!req.body[field]) {
//         logger.error(`${field} is required`);
//         return res.status(400).send(`'${field}' is required`);
//       }
//     }
//     const { title, url, description, rating } = req.body;

//     if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
//       logger.error(`Invalid rating '${rating}' supplied`);
//       return res.status(400).send(`'rating' must be a number between 0 and 5`);
//     }

//     const bookmark = { id: uuid(), title, url, description, rating };

//     store.bookmarks.push(bookmark);

//     logger.info(`Bookmark with id ${bookmark.id} created`);
//     res
//       .status(201)
//       .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
//       .json(bookmark);
//   });

// // Bookmarks ID router
// bookmarksRouter
//   .route("/bookmarks/:bookmark_id")

//   // GET
//   .get((req, res) => {
//     const { bookmark_id } = req.params;

//     const bookmark = store.bookmarks.find(c => c.id == bookmark_id);

//     if (!bookmark) {
//       logger.error(`Bookmark with id ${bookmark_id} not found.`);
//       return res.status(404).send("Bookmark Not Found");
//     }

//     res.json(bookmark);
//   })

//   // DELETE
//   .delete((req, res) => {
//     const { bookmark_id } = req.params;

//     const bookmarkIndex = store.bookmarks.findIndex(
//       b => b.id === bookmark_id
//     );

//     if (bookmarkIndex === -1) {
//       logger.error(`Bookmark with id ${bookmark_id} not found.`);
//       return res.status(404).send("Bookmark Not Found");
//     }

//     store.bookmarks.splice(bookmarkIndex, 1);

//     logger.info(`Bookmark with id ${bookmark_id} deleted.`);
//     res.status(204).end();
//   });

// module.exports = bookmarksRouter;
