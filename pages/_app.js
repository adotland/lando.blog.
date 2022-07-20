import 'nextra-theme-blog/style.css'
import Head from 'next/head'
// import Prism from 'prism-react-renderer/prism'
// (typeof global !== "undefined" ? global : window).Prism = Prism
// require("prismjs/components/prism-sql")
// require("prismjs/components/prism-javascript")
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import useScrollRestoration from '../utils/hooks/useScrollRestoration';


import '../styles/main.css'
import '../styles/nprogress.css'

export default function Nextra({ Component, pageProps }) {
  const router = useRouter()
  useScrollRestoration(router);

  NProgress.configure({ showSpinner: false })

  useEffect(() => {
    const handleStart = (url) => {
      NProgress.start()
    }
    const handleStop = () => {
      NProgress.done()
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  const meta = {
    title: 'Lando.blog.',
    description:
      'Mostly Javascript, Node.js, Next.js, React.js, Whateversupnext.js',
  }

  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS"
          href="/feed.xml"
        />
        <link
          rel="preload"
          href="/fonts/Inter-roman.latin.var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <meta name="description" content={meta.description} />
        <meta property="og:site_name" content={meta.title} />

        {/* <meta property="og:image" content={meta.image} /> */}
        {/* <meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@yourname" />
<meta name="twitter:title" content={meta.title} />
<meta name="twitter:description" content={meta.description} />
<meta name="twitter:image" content={meta.image} /> */}
      </Head>
      <Component {...pageProps} />
    </>
  )
}
