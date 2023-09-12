import { Github } from 'lucide-react';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import { Textarea } from './components/ui/textarea';

export function App() {
  return (
    <div className='min-h-screen flex flex-col'>
      {/* Header */}
      <div className='px-6 py-3 flex items-center justify-between border-b'>
        <h1 className='text-xl font-bold'>upload.ai</h1>

        <div className='flex items-center gap-3'>
          <span className='text-sm text-muted-foreground'>
            Desenvolvido com 💜 no NLW da Rocketseat
          </span>

          <Separator orientation='vertical' className='h-6' />

          <Button variant='outline'>
            <Github className='w-4 h-4 mr-2' />
            Github
          </Button>
        </div>
      </div>

      <main className='flex-1 p-6 flex gap-6'>
        {/* Content */}
        <div className='flex flex-col flex-1 gap-4'>
          <div className='grid grid-rows-2 gap-4 flex-1'>
            <Textarea 
              className='resize-none p-4 leading-relaxed'
              placeholder='Inclua o prompt para a IA...'
            />
            <Textarea 
              className='resize-none p-4 leading-relaxed'
              placeholder='Resultado gerado pela IA'
              readOnly
            />
          </div>

          <p className='text-sm text-muted-foreground'>
          Lembre-se: você pode utilizar a variável <code className="text-violet-400">{`{transcription}`}</code> no seu prompt para adicionar o conteúdo da transcrição do vídeo selecionado.
          </p>
        </div>

      </main>
    </div>
  )
}
