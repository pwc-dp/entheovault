import { PsychedelicDBIcon } from './Icons'

const Footer = (): JSX.Element => {
  return (
    <footer className='container relative my-4 flex w-full items-center justify-between border-t px-6 pb-3 pt-4 text-sm sm:pb-4 sm:pt-5 lg:px-10'>
      <PsychedelicDBIcon className='h-6 w-6 text-muted-foreground md:h-7 md:w-7' />
      <div className='flex items-center gap-[3px] pl-0.5 text-sm text-muted-foreground'>
        <span>©</span>
        <span className='font-noto text-[13px]'>台灣啟靈意識研究學會</span>
      </div>
    </footer>
  )
}

export default Footer
