import {NextApiRequest, NextApiResponse} from 'next' 
import { getSession } from 'next-auth/react'
import { stripe } from '../../services/stripe'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST') {
        const session = await getSession({req})

        //criando um customer e passando o email que veio da requição
        //apartir do envio do formulário
        //Nesse momento de criação o usuário recebe um ID do stripe
        const subscriptionCustomer = await stripe.customers.create({
            email: session.user.email
        })

        const priceId = 'price_1KgZ0sHe64Q0CHFPH6cxEHMJ'

        const stipeCheckoutSession = await stripe.checkout.sessions.create({
            customer: subscriptionCustomer.id,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                { price: priceId, quantity: 1 }
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL
            
        })

        return res.status(200).json({ sessionId: stipeCheckoutSession.id })

    } else {
        //caso o método não seja POST
        res.setHeader('allow,', 'POST')
        res.status(405).end('Method not allowed')
    }
}