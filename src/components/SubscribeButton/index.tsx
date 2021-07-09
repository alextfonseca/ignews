import { useSession, signIn } from "next-auth/client";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";
import styles from "./styles.module.scss";

interface SignInButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SignInButtonProps) {
  const [session] = useSession();
  // função para criar o usuário no stripe e fazer a sessão de checkout
  async function handleSubscribe() {
    // se o usuário não estiver logado ele vai para a tela de login
    if (!session) {
      signIn("github");
      return;
    }

    try {
      // puxando os dados da rota api criada no subscribe.ts
      const response = await api.post("/subscribe");
      // pegando o id do usuário
      const { sessionId } = response.data;

      const stripe = await getStripeJs();
      // redirecionando o usuário para o checkout
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      // mostrando uam mensagem de erro caso não seja possível criar o usuário
      alert(err.message);
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe Now
    </button>
  );
}
