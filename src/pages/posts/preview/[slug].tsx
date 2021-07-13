import { getSession, useSession } from "next-auth/client";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../../services/prismic";

import styles from "../post.module.scss";

import Head from "next/head";
import { redirect } from "next/dist/next-server/server/api-utils";
import { GetStaticProps } from "next";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/dist/client/router";
//  tipando as informações dentro do array separadamente
type PostsPreviewProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
};

const PostPreview = ({ post }: PostsPreviewProps) => {
  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>Ignews | {post.title}</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>

          <time>{post.updatedAt}</time>

          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading ?
            <Link href="/">
              <a href="#">Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default PostPreview;

// gera as paginas toda vez que a página de posts for acessada
export const getStaticProps: GetStaticProps = async ({ params }) => {
  // pegando o que foi digitado depois do /api/posts com params
  const { slug } = params;

  // carrehando o cliente do prismic
  const prismic = getPrismicClient();

  // pegando os dados do prismic pelo UID do post. Se não quiser passar configurações é só deixar um objeto vazio
  const response = await prismic.getByUID("publication", String(slug), {});

  // formatação dos dados
  const post = {
    slug: slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-Br",
      {
        day: "2-digit", // 2 dígitos do dia
        month: "long", // mes por completo
        year: "numeric", // ano em valor numero
      },
    ),
  };

  return {
    props: { post },

    revalidate: 60 * 30, //30 minutos
  };
};
