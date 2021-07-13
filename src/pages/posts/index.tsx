import { GetStaticProps } from "next";

import Head from "next/head";
import styles from "./styles.module.scss";
// imporatndo o arquivo da pasta services
import { getPrismicClient } from "../../services/prismic";

// conversor de formato do prismic para texto ou html
import { RichText } from "prismic-dom";

import Prismic from "@prismicio/client";

import Link from "next/link";

//  tipando as informações dentro do array separadamente
type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};
// tipagem dos dados da API
interface PostsProps {
  posts: Post[];
}

const Posts = ({ posts }: PostsProps) => {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link href={`/posts/${post.slug}`} key={post.slug}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  // buscando os dados
  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "publication")],
    {
      // o que queremos das publicações
      fetch: ["publication.title", "publication.content"],

      // quantos posts você quer retornar
      pageSize: 100,
    },
  );
  // formatação dos dados vindos da API
  const posts = response.results.map((post) => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title), // formatação dos dados para texto
      excerpt:
        post.data.content.find((content) => content.type === "paragraph")
          ?.text ?? "", // encontrar o primeiro paragrafo do post se não ele retorna uma string vazia se não achar
      // formatação da data para o padrão brasileiro
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-Br",
        {
          day: "2-digit", // 2 dígitos do dia
          month: "long", // mes por completo
          year: "numeric", // ano em valor numero
        },
      ),
    };
  });

  return {
    props: {
      posts,
    },
  };
};

export default Posts;
