import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { getPrismicClient } from '../../services/prismic'
import * as prismicH from "@prismicio/helpers";
import Head from "next/head";

import styles from './post.module.scss'

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    createdAt: string;
  }
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
          <title>Post | Ig.news</title>
      </Head>

      <main className={styles.postContainer} >
        <article className={styles.post} >
          <h1>{post.title}</h1>
          <time>{post.createdAt}</time>

          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{__html: post.content}}
          >
          </div>
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const prismic = getPrismicClient()

  //verificar se o usuário está logado
  const session = await getSession({ req })

  //pegar o slug de dentro do params para buscar os dados do post
  const { slug } = params

  //se o usuário não tiver uma assinatura ativa, ele então, será redirecionado para a página
  //principal
  if(!session?.activeSubscription) {
    return {
      redirect: {
        destination: `/`,
        permanent: false
      }
    }
  }

  //pegando um post específico atravez do seu slug que é um identificador
  const response = await prismic.getByUID("post", String(slug))

  //formatando os dados 
  const post = {
    slug,
    title: prismicH.asText(response.data.title),
    content: prismicH.asHTML(response.data.content),
    createdAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
        day: "2-digit",
        month: "long",
        year: "numeric"
    })
  }

  return {
    props: { post }
  }
}