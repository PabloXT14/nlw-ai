import 'dotenv/config'
import { fastify } from 'fastify'
import cors from '@fastify/cors'

import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideoRoute } from './routes/upload-video'
import { createTranscriptionRoute } from './routes/create-transcription'
import { generateAiCompletionRoute } from './routes/generate-ai-completion'

const app = fastify()

const PORT = 3333

app.register(cors, {
  origin: process.env.ENABLED_CORS?.split(';') ?? ['*'],
})

app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generateAiCompletionRoute)

app.listen({
  port: PORT,
  host: '0.0.0.0',
}).then(() => {
  console.log(`Server listening on port ${PORT}!`)
})