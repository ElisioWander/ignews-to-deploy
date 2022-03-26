import { GetStaticProps } from 'next'

import Head from "next/head";
import { SubscribeButton } from "../Components/SubscribeButton";
import { stripe } from '../services/stripe'; 

import styles from './home.module.scss'

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | Ig.news</title>
      </Head>

      <main className={styles.contentContainer} >
        <section className={styles.hero} >
          <span>👏 Hey, welcome!</span>

          <h1>News about the <span>React</span> world!</h1>

          <p>
            Get access to all publications <br/>
            <span>for {product.amount} month</span>
          </p>

          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

//usando o getStaticPros o next vai criar, atravez da camada de Node, um HTML da página
//de forma estática, ou seja, não importa a quantidade de usuários que acesse aquela página, ela
//sempre será a mesma, não vai ter a necessidade de ir buscar o HTML todas as vezes que um usuário
//acessar a página. Usar o getStaticProps é recomendado em casos em que não há necessidade de dados,
//dinâmicos na págiona. Uma página que é igual para todos os clientes se encaixa perfeitamente
//nesse caso. A Home do Ignews é igual para todos os usuários.
//A única informação dinâmica na Home é o preço, mas esse, dificilmente, vai ser alterado. Ainda assim,
//caso o preço mude, ele irá mudar para todos os usuários, e o getStaticSite tem uma opção chamada revalidate
//que nos permite definir um tempo para que os dados sejam revalidados

//O getStaticProps também faz o trabalho de ir buscar os dados e mantelos na camada do Node, e por 
//isso o conteúdo que foi chamado vai aparecer em tela mesmo se o javascript estiver desabilitado, ou seja,
//é usado, também, para indexação.
export const getStaticProps: GetStaticProps = async () => {
  //fazendo uma chamada API parao stripe atravez da SDK do stripe instalada, e pegando 
  //o ID do price criado no site do stripe
  const price = await stripe.prices.retrieve('price_1KgZ0sHe64Q0CHFPH6cxEHMJ')

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  })

  //é sempre interessante formatar os dados no momento da chamada, e não quando forem
  //renderizados
  const product = {
    priceId: price.id,
    amount: formatter.format(price.unit_amount / 100) //tirando o valor da unidade do price
  }

  return {
    props: {
      product
    }, 
    revalidate: 60 * 60 * 24 //24horas
  }
} 
