import { GetStaticProps, GetStaticPaths } from 'next'
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getPrismicClient } from '../../../services/prismic'
import * as prismicH from "@prismicio/helpers";
import Head from "next/head";
import Link from "next/link";

import styles from '../post.module.scss'

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    createdAt: string;
  }
}

export default function PostPreview({ post }: PostPreviewProps) {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if(session?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  }, [session])

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
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{__html: post.content}}
          >
          </div>

          <div className={styles.continueReading} >
            Wanna continue reading?

            <Link href="/" >
              <a>Subscribe Now 🤗</a>
          </Link>
          </div>

        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  //pegar o slug de dentro do params para buscar os dados do post
  const { slug } = params

  const prismic = getPrismicClient()

  //pegando um post específico atravez do seu slug que é um identificador
  const response = await prismic.getByUID("post", String(slug))

  //formatando os dados 
  const post = {
    slug,
    title: prismicH.asText(response.data.title),
    content: prismicH.asHTML(response.data.content.splice(0, 3)),
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
