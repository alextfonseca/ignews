// importando a função do fauna de dentro de services
import { fauna } from "../../../services/fauna";

import { stripe } from "../../../services/stripe";

// importando o método de pegar dados do fauna db
import { query as q } from "faunadb";

// essa função vai salvar os dados da requisição do stripe no banco de dados
export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false,
) {
  // buscar o usuário no banco do faina com o id customer id

  // pegando a Ref do usuário dentro do faunadb
  const userRef = await fauna.query(
    // seleciona apenas um campo dentro do fauna
    q.Select(
      "ref",
      // pegar o usuario
      q.Get(
        // que bate
        q.Match(
          // com os dados dentro do user_by_stripe_customer_id
          q.Index("user_by_customer_id"),
          customerId,
        ),
      ),
    ),
  );

  // pegando todos os dados da compra
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // salvando apenas os dados que são realmente importantes de
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price: subscription.items.data[0].price.id,
  };

  if (createAction) {
    //salvar os dados da subscription do usuário no fauna db

    // cria uma nova inscrição para o usuário
    await fauna.query(
      q.Create(q.Collection("subscriptions"), { data: subscriptionData }),
    );
    // se ele ja tiver feito apenas atualiza os dados do cartão ou nome por exemplo
  } else {
    await fauna.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(
            q.Match(
              q.Index('subscription_by_id'),
              subscriptionId,
            )
          )
        ),
        {data: subscriptionData}
      )
      );
  }
}
