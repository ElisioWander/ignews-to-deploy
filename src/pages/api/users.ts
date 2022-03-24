import { NextApiRequest, NextApiResponse } from 'next' 

//todo o código está sendo executado no servidor do Next que é feito com Node.
//Dessa forma, todos os arquivos que estiverem dentro da pasta API serão uma rota para receber,
//e enviar dados. Uma espécie de back-end no fron-end
export default (request: NextApiRequest, response: NextApiResponse) => {
    const users = [
        {id: 1, name: 'Elisio'},
        {id: 2, name: 'Wander'},
        {id: 3, name: 'Ferreira'}
    ]

    return response.json(users)
}