import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { fauna } from "../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../services/stripe";

type User = {
    ref: {
        id: string;
    },
    data: {
        stripe_customer_id: string;
    }
}

//essa requisição é feita apartir do momento que o usuário clina no botão de se inscrever
//na página principal da aplicação.
//o processo de verificar se o usuário que fez a requisição já tem uma assinatura no stripe,
//e, se não tiver, criar uma assinatura, esse processo ele é feito bem no momento da requsição, uma checkout session
//Ter uma inscrição no stripe não significa que o usuário comprou o produto,ou seja, uma assinatura ativa
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const session = await getSession({ req });

    //buscando o usuário no faunaDB de acordo com o email
    //que está vindo atravez da requisição
    const user = await fauna.query<User>(
        q.Get(
            q.Match(
                q.Index('user_by_email'),
                q.Casefold(session.user.email)
            )
        )
    )

    //se o usuário tiver uma assinatura no stripe então vai estar registrado no banco de dados
    //se tiver salvo no banco de dados, etnão, deve ser armazenado na variável customerId
    let customerId = user.data.stripe_customer_id


    //se o usuário que fez a requisição ainda não tiver uma inscrição dentro do
    //stripe, então, vai ser criado a inscrição e atribuido um ID
    if(!customerId) {
        //criando um customer e passando o email que veio da requição
        //apartir do envio do formulário
        //Nesse momento de criação o usuário recebe um ID do stripe
        const stripeCustomer = await stripe.customers.create({
            email: session.user.email,
        });

        //salvar no banco de dados o ID do usuário que acabou de ser
        //registrado no stripe
        await fauna.query(
            q.Update(
                q.Ref(q.Collection('users'), user.ref.id),
                {
                    data: {
                        stripe_customer_id: stripeCustomer.id
                    }
                }
            )
        )

        //retornar na variável customerId os dados que foram criados no banco de dados
        //após o usuário ser cadastrado no stripe
        return customerId = stripeCustomer.id
    }

    
    const priceId = "price_1KgZ0sHe64Q0CHFPH6cxEHMJ";

    const stipeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({ sessionId: stipeCheckoutSession.id });
  } else {
    //caso o método não seja POST
    res.setHeader("allow,", "POST");
    res.status(405).end("Method not allowed");
  }
};
