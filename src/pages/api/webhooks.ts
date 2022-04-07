import { NextApiRequest, NextApiResponse } from "next";

import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/managerSubscription";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

//eventos que queremos ouvir de dentro do webhook do stripe
const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //Verificar se o tipo da requisição é um POST
  if (req.method === "POST") {
    //passando para a função buffer que fica responsável por
    //transformar a requisição em um tipo "stream"
    // const buf = await buffer(req);
    const secret = req.headers["stripe-signature"];

    //uma forma que o stripe recomenda para monitorar os eventos
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      return res.status(400).send(`Webhook error: ${error.message}`);
    }

    //aqui vai vir o tipo do evento
    const { type } = event;

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription;

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            );

            break;
          case "checkout.session.completed":
            const checkoutSession = event.data.object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            );

            break;
          default:
            throw new Error("Unhandled event.");
        }
      } catch (error) {
        console.log(error)
        return res.json({ error: 'Webhook handle failed.' })
      }
    }

    res.json({ received: true })
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
