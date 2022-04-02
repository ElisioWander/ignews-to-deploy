import * as prismicH from "@prismicio/helpers";
import Link from 'next/link'

import { GetStaticProps } from "next";
import Head from "next/head";
import { prismicClient } from "../../services/prismic";

import styles from "./styles.module.scss";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

interface PostsProps {
  posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
          <title>Posts | Ig.news</title>
      </Head>

      <main className={styles.postsContainer}>
        <div className={styles.posts}>
          { posts.map(post => (
            <Link href={`/posts/${post.slug}`} key={post.slug} >
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          )) }
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await prismicClient.getAllByType("post", {
    fetch: ["post.title", "post.content"],
    pageSize: 100,
  });

  //sempre formatar os dados no momento da busca e não da hora de exibir os dados na interface
  const posts = response.map((post) => {
    return {
      slug: post.uid, //identificador
      title: prismicH.asText(post.data.title), //formatando para texto
      excerpt: post.data.content.find((content) => content.type === "paragraph")?.text ?? "",
      //buscando o primeiro paragrafo do que seja um texto
      //pode acontecer de vir uma imagem ou um título ou algo assim. Aqui, queremos, especificamente, o primeiro parágrafo de texto
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    };
  });

  //console.log para debug em terminal
  //fazendo esse processo você tem acesso a informações que estão
  //dentro de array's
  // console.log(JSON.stringify(response, null, 2));

  return {
    props: { posts },
  };
};
