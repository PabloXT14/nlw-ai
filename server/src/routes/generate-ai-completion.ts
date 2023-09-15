import 'dotenv/config'
import { FastifyInstance} from 'fastify'
import { z } from 'zod'
import { streamToResponse, OpenAIStream } from 'ai'

import { prisma } from '../lib/prisma'
import { openai } from '../lib/openai'

export async function generateAiCompletionRoute(app: FastifyInstance) {
  app.post('/ai/complete', async (request, reply) => {
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    })

    const { videoId, prompt, temperature } = bodySchema.parse(request.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      }
    })

    if (!video.transcription) {
      return reply.status(404).send({ error: 'Video transcription was not generated yet.' })
    }

    const promptMessage = prompt.replace('{transcription}', video.transcription)

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature,
      messages: [
        { role: 'user', content: promptMessage },
      ],
      stream: true,
    })

    // Configurando Stream de AI para ir devolvendo a resposta do OpenAI aos poucos para o Front-end conforme for sendo gerada
    const stream = OpenAIStream(response)

    // reply.raw = response nativo do node sem o wrapper do fastify por volta
    return streamToResponse(stream, reply.raw, {
      headers: {
        'Access-Control-Allow-Origin': process.env.ENABLED_CORS ?? '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      },
    })
  })
}