import { signIn, useSession } from "next-auth/react";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stipe-js";
import { useRouter } from 'next/router'

import styles from "./styles.module.scss";

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter()

  //quando o usuário clicar no botaão de Subscribe vai ser chamada a rota
  //subscribe feita na API Routes e se tudo estiver nos conformes ele será
  //redirecionado para a página de pagamento do stripe
  async function handleSubscribe() {
    //verificar se o usuário está logado
    //caso não esteja, a função signIn do next-auth será chamada para ele
    //fazer o signIn
    if (!session) {
      signIn("github");
      return;
    }

    //caso o usuário tenha uma assinatura ativa e tente assinar novamente clicando no botão
    //de "Subscribe now", ele será redirecionado para a página de posts
    if(session.activeSubscription) {
      router.push("/posts")
      return;
    }

    try {
      //fazendo a requisição POST para a rota subscribe  
      const response = await api.post("/subscribe");

      //a rota deve nos retornar o sessionID 
      const { sessionId } = response.data;

      //configurando a API do stripe que fica roda no lado do cliente
      const stripe = await getStripeJs();

      //redirecionando o usuário para a tela de pagamento e passando o sessionID que foi retornado
      //de dentro da rota "subscribe"
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      alert(error.message);
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
