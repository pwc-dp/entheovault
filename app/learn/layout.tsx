import Footer from '@/components/Footer'

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className='relative flex flex-1 flex-col'>
      <main
        id='guide-main'
        className='container flex-1 px-6 py-8 sm:py-12 lg:px-10'
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}
