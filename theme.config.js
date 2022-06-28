const YEAR = new Date().getFullYear()

export default {
  cusdis: {
    appId: process.env.CUSDIS_APP_ID,
    lang: 'en'
  },
  // darkMode: true,
  footer: (
    <footer>
      <small>
        <time>{YEAR}</time> © lando.
        <a href="/feed.xml">RSS</a>
      </small>
      <style jsx>{`
        footer {
          margin-top: 8rem;
        }
        a {
          float: right;
        }
      `}</style>
    </footer>
  )
}
