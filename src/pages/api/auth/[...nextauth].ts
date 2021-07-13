import NextAuth from "next-auth";
// -------------------------------------------------------
// importações do fauna para criar o banco
import { query } from "faunadb";
// importando o falnaDB para poder salvar as informações do usuário
import { fauna } from "../../../services/fauna";

import Providers from "next-auth/providers";
export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: "read:user",
    }),
  ],

  // inserindo as informações no banco de dados
  callbacks: {
    // não deixando que o usuário se ja estiver inscrito se inscreva novamente
    async session(session) {
      try {
        const userActiveSubscription = await fauna.query(
          query.Get(
            query.Intersection([
              query.Match(
                query.Index("subscription_by_user_ref"),
                query.Select(
                  "ref",
                  query.Get(
                    query.Match(
                      query.Index("user_by_email"),
                      query.Casefold(session.user.email),
                    ),
                  ),
                ),
              ),
              query.Match(query.Index("subscription_by_status"), "active"),
            ]),
          ),
        );

        return {
          ...session,
          activeSubscription: userActiveSubscription,
        };
      } catch {
        return {
          ...session,
          activeSubscription: null,
        };
      }
    },

    async signIn(user, account, profile) {
      // pegando o email do usuario
      const { email } = user;

      try {
        // salvando o email no banco
        await fauna.query(
          // verifica se o usuario ja existe
          // se
          query.If(
            // nao
            query.Not(
              // existir
              query.Exists(
                // um email que bate com o user.email
                query.Match(
                  // onde esta o email no fauna
                  query.Index("user_by_email"),
                  // deixa em caixa baixa
                  query.Casefold(user.email),
                ),
              ),
            ),
            // cria o usuario
            query.Create(query.Collection("users"), { data: { email } }),
            // senão pega as informações do usuário
            // select do sql server
            query.Get(
              query.Match(
                // onde esta o email no fauna
                query.Index("user_by_email"),
                // deixa em caixa baixa
                query.Casefold(user.email),
              ),
            ),
          ),
        );
        return true;
      } catch {
        return false;
      }
    },
  },
});
