import { config } from 'dotenv'

import { createApp } from './app.js'

config()

const PORT = Number(process.env.PORT ?? 3000)

const app = createApp()
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`backend listening on port ${PORT}`)
})

