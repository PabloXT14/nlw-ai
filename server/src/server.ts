import { fastify } from 'fastify'
import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideoRoute } from './routes/upload-video'

const app = fastify()

const PORT = 3333

app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)

app.listen({
  port: PORT,
  host: '0.0.0.0',
}).then(() => {
  console.log(`Server listening on port ${PORT}!`)
})