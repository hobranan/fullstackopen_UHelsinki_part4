// require('dotenv').config() // Loads .env file contents into process.env by default
const app = require('./app') // the actual Express application
const config = require('./utils/config')
const logger = require('./utils/logger')

app.app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}: http://localhost:${config.PORT}/api/blogs`)
})
