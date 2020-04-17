const uuid = require('uuid/v4')

const bookmarks = [
  { id: uuid(),
    title: 'Strava',
    url: 'https://www.strava.com',
    description: 'Fitness App',
    rating: 5 },
  { id: uuid(),
    title: 'Mint',
    url: 'https://mint.intuit.com/',
    description: 'Finance App',
    rating: 4 },
  { id: uuid(),
    title: 'The Atlantic',
    url: 'https://www.theatlantic.com/',
    description: 'News',
    rating: 5 },
]

module.exports = { bookmarks };