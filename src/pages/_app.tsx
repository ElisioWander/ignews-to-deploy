import { AppProps } from 'next/app'
import { SessionProvider, SessionProviderProps } from 'next-auth/react'
import { Header } from '../Components/Header/index'

import '../styles/global.scss'



function MyApp({ Component, pageProps: {session, ...pageProps} }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
