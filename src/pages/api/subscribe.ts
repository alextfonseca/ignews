import { NextApiRequest, NextApiResponse } from "next";
// método para pegar informações do cookies no back-end
import { getSession } from "next-auth/client";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";
import {query as q} from 'faunadb'

// criando a tipagem do usuário
type User =  {
  ref: {
    id: string
  }
  data:{
    stripe_customer_id: string
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    // pegando as informações do usuario logado dos cookies
    const session = await getSession({ req });

// buscando qual foi o id do usuário
    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    // verifica se o usuário ja esta logado no stripe
    let customerId = user.data.stripe_customer_id
// se ainda não, ele é criado dentro do banco de dados e no stripe
    if(!customerId){
      // cadastrando o usuário no stripe com as informações dos cookies
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      })
      // atualizando os dados do usuário no fauna db
      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),{
            data: {
              stripe_customer_id: stripeCustomer.id,
            }
          }
        )
      )
      customerId = stripeCustomer.id
    }


    // ------- Configurações da sessão do stripe ---------
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      // id do usuário dentro do stripe
      customer: customerId,
      // metodo de pagamento
      payment_method_types: ["card"],
      // endereço do usuário
      billing_address_collection: "required",
      // informações dos produtos que são vendidos
      line_items: [{ price: "price_1IvkIHLXNA7OP6TFXghVX3x5", quantity: 1 }],
      // qual é o método de assinatura
      mode: "subscription",
      // permitir códigos de descontos
      allow_promotion_codes: true,
      // URL para sucesso da compra
      success_url: process.env.STRIPE_SUCCESS_URL,
      // URL para página de erro
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

// criando uma rota API com as informações para serem consumidas no front end
    return res.status(200).json({sessionId: stripeCheckoutSession.id})

  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
