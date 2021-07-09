// importando o prismic que acabamos de instalar
import Prismic from '@prismicio/client'

export function getPrismicClient(req?: unknown) {
  const prismic = Prismic.client(
    // edereço da nossa api dentro de configurações e API está o código
    process.env.PRISMIC_ENDPOINT,
    // configuração
    {
      req: req,
      // passando a senha de acesso
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
    }
  )

  return prismic
}