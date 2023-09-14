import {
  ChangeEvent,
  FormEvent,
  useState,
  useMemo,
  useRef
} from 'react'
import { FileVideo, Upload } from 'lucide-react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'

import { getFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { api } from '@/lib/axios'

const statusMessages = {
  waiting: 'Carregar video',
  converting: 'Convertendo...',
  uploading: 'Enviando...',
  generating: 'Transcrevendo...',
  success: 'Sucesso!',
  error: 'Erro!'
} as const

type Status = keyof typeof statusMessages

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('waiting')
  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget

    if (!files) {
      return
    }

    // OBS: sempre teremos um único arquivo selecionado (pois não colocamos no input de file a propriedade multiple)
    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  async function converteVideoToAudio(video: File) {
    console.log('Convert started.')

    const ffmpeg = await getFFmpeg()

    await ffmpeg.writeFile('input.mp4', await fetchFile(video)) // enviando arquivo de video para o container do ffmpeg

    // ffmpeg.on('log', log => console.log(log)) // mostrando logs de erros

    // Acompanhando progresso da conversão
    ffmpeg.on('progress', progress => {
      console.log('Convert progress: ' + Math.round(progress.progress * 100) + '%')
    })

    // Comando de conversão (jogue o comando no ChatGPT para entender em detalhes)
    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ])


    // Lendo arquivo de áudio
    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
    const audioFile = new File([audioFileBlob], 'audio.mp3', { type: 'audio/mpeg' })

    console.log('Convert finished.')

    return audioFile
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const prompt = promptInputRef.current?.value

    if (!videoFile) {
      return
    }

    // Convertendo vídeo em áudio
    setStatus('converting')
    const audioFile = await converteVideoToAudio(videoFile)

    // Enviando áudio para o nosso servidor
    setStatus('uploading')
    const data = new FormData() // formato que enviamos arquivos para o servidor

    data.append('file', audioFile)

    const response = await api.post('/videos', data)

    // Gerando transcrição do vídeo
    setStatus('generating')
    const videoId = response.data.video.id

    await api.post(`/videos/${videoId}/transcription`, {
        prompt,
    })

    setStatus('success')
    console.log('finalizado!')
  }

  const previewURL = useMemo(() => {
    if(!videoFile) {
      return null
    }

    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form className='space-y-6' onSubmit={handleUploadVideo}>
      <label
        htmlFor="video"
        className='relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5'
      >
        {previewURL ? (
          <video src={previewURL} controls={false} className='pointer-events-none inset-0' />
        ) : (
          <>
            <FileVideo className='w-4 h-4' />
            Selecione um vídeo
          </>
        )}
      </label>

      <input type="file" id="video" accept='video/mp4' className='sr-only' onChange={handleFileSelected} />

      <div className='space-y-2'>
        <Label htmlFor='transcription_prompt'>
          Prompt de transcrição
        </Label>
        <Textarea
          ref={promptInputRef}
          disabled={status !== 'waiting'}
          id='transcription_prompt'
          placeholder='Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)'
          className='h-20 leading-relaxed resize-none'
        />
      </div>

      <Button
        data-success={status === 'success'}
        type='submit'
        disabled={status !== 'waiting'}
        className='w-full data-[success=true]:bg-emerald-400'
      >
        {statusMessages[status]}
        {status === 'waiting' && <Upload className='w-4 h-4 ml-2' />}
      </Button>

    </form >
  )
}
