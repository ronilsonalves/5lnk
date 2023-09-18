import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import ShortLink from '@/components/ShortLink'
import Navbar from '@/components/Navbar'
import Features from '@/components/sections/About'
import HomeBlog from '@/components/sections/HomeBlog'

export default function Home() {
  return (
    <>
    <main>
      <Navbar />
      <Hero>
        {<ShortLink />}
      </Hero>
      <Features />
      <HomeBlog />
    </main>
    <Footer />
    </>
  )
}
