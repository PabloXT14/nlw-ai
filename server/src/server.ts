import { fastify } from 'fastify'

const app = fastify()

const PORT = 3333

app.get('/', (request, reply) => {
  reply.send('Hello World 🚀!')
})

app.listen({
  port: PORT,
  host: '0.0.0.0',
}).then(() => {
  console.log(`Server listening on port ${PORT}!`)
})