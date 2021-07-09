// importações dos tipos do request e response
import { NextApiRequest, NextApiResponse } from "next";

// import para poder ler aos poucos os dados so stripe
import { Readable } from 'stream'

// importando a SDK do stripe
import Stripe from "stripe";

// importando os serviços do stripe de dentro de services stripe.ts
import { stripe } from "../../services/stripe";
// importando o saveSubscription que foi criado na pasta API _lib para guardar as informações do usuário no banco de dados
import { saveSubscription } from "./_lib/manageSubscription";

// código do Node.js para ler os dados para converter os dados em um objeto
async function buffer(readable: Readable){
  const chunks = []

  for await (const chunk of readable){
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }
  return Buffer.concat(chunks)
}
// desabilitar o bodyParser do retorno 
export const config = {
  api: {
    bodyParser: false,
  }
}

// configurando quais eventos nós queremos ouvir do webhook do stripe
const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

// exportando uma função com os dados da api
export default async (req: NextApiRequest, res: NextApiResponse) => {

  if(req.method === 'POST'){

    // adicionando os dados que vem da requisição para passar pela função do Node.js para transformação em um objeto legivel
    const buf = await buffer(req) // aqui estão os dados da nossa requisição para o webhook do stripe

    // garda em uma variavel qual é a senha que está sendo enviada para nossa aplicação
    const secret = req.headers['stripe-signature']

    // fazendo a verificação para ver se a chave que veio na variavel a cima é a mesma que está no .env.local
    let event: Stripe.Event

    try{
      // se ele conseguir construir esse event quer dizer que a senha esta correta
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
    } catch(err){
      // se a senha não bater ele vai retornar um erro
      return res.status(400).send(`webhook error: ${err.message}`)
    }

    // retorna todas as informações da transação
    const { type } = event

    if(relevantEvents.has(type)){

      try{
      // dependendo dos dados do pagamento vamos fazer uma coisa diferente
      switch(type){
        // dados da inscrição que vem no webhook
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':

        const subscription = event.data.object as Stripe.Subscription

        // passando os ids do usuario e da compra para o arquivo manageSubscription para atualizar os dados
        await saveSubscription(
          subscription.id,
          subscription.customer.toString(),
          false
        )


          break
        
        case 'checkout.session.completed':

        // fazendo a tipagem dos dados vindo da variavel event 
        const checkoutSession = event.data.object as Stripe.Checkout.Session

        // passando os dados do id da inscrição do usuário e do id do usuário para o arquivo manageSubscription.ts dentro de API _lib
        await saveSubscription(
          checkoutSession.subscription.toString(), // id da subscription
          checkoutSession.customer.toString(), // id do usuário
          true
        )

          break
          default:
            throw new Error('Unhandled event')
      }
      }catch (err){
        return res.json({error: 'Webhook handler failed'})
      }
    }
  
    res.json({received: true})

  }else{
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}