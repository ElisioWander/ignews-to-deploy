import NextAuth from 'next-auth'
import GithubProvider from "next-auth/providers/github"

import { Index, query as q } from 'faunadb'
import { fauna } from '../../../services/fauna'

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
        authorization: {
            params: {
                scope: 'repo read:user'
            }
        }
      }),
      // ...add more providers here
    ],
    callbacks: {
      async signIn({user, account, profile, credentials}) {
        const { email } = user

        //inserindo o email no banco de dado do usuário que efetuou o login
        //os dados estão sendo inseridos na Collection que foi criada no dashboard do faunaDB
        //Collection com o nome de users

        try {
          await fauna.query(
            q.If(
              q.Not(
                q.Exists(
                  q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(user.email)
                  )
                )
              ),
              q.Create(
                q.Collection('users'),
                { data: { email } }
              ),
              q.Get(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            )
            
          )
          return true
        } catch {
          console.log('Não deu')

          return false
        }
      }
    },
    secret: process.env.JWT_SECRET
  })
  