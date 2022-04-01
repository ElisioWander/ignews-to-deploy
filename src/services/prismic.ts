import * as prismic from '@prismicio/client'

export const repositoryName = 'ignewsPROD2022'

const endPoint = prismic.getRepositoryEndpoint(repositoryName)

export const prismicClient = prismic.createClient(endPoint, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
})