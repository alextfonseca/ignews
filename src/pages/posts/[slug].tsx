import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../services/prismic";

import styles from "./post.module.scss";

import Head from "next/head";
//  tipando as informações dentro do array separadamente
type PostsProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
};

const Post = ({ post }: PostsProps) => {
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
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  );
};

export default Post;

// gera as paginas toda vez que a página de posts for acessada
export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  // verificar se o usuário está logado ou não
  const session = await getSession({ req });

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // pegando o que foi digitado depois do /api/posts com params
  const { slug } = params;

  // carrehando o cliente do prismic
  const prismic = getPrismicClient(req);

  // pegando os dados do prismic pelo UID do post. Se não quiser passar configurações é só deixar um objeto vazio
  const response = await prismic.getByUID("publication", String(slug), {});

  // formatação dos dados
  const post = {
    slug: slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
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
  };
};
