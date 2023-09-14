import { fastify } from 'fastify'
import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadVideoRoute } from './routes/upload-video'
import { createTranscriptionRoute } from './routes/create-transcription'
import { generateAiCompletionRoute } from './routes/generate-ai-completion'

const app = fastify()

const PORT = 3333

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