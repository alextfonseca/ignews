// importando o stripe
import Stripe from 'stripe'
// importando a versao do projeto do package.json
import {version} from '../../package.json'

// criando a constante com os dados da api
export const stripe = new Stripe(
// chave privada que esta dentro do .env.local
  process.env.STRIPE_API_KEY,

  // informações obrigatórias
  {
    apiVersion: '2020-08-27',
    appInfo:{
      name: 'ignews',
      version
    },
  }
)