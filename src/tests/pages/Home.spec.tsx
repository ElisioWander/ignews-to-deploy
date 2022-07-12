import { render, screen } from "@testing-library/react"
import { stripe } from "../../services/stripe"
import Home, { getStaticProps } from "../../pages/index"

jest.mock('next-auth/react', () => {
  return {
    useSession() {
      return { data: null, status: 'unauthenticated' }
    }
  }
})
jest.mock('next/router')
jest.mock('../../services/stripe')

describe('Home page', () => {
  it('rendres correclty0', () => {
    const productProps = {
      priceId: 'fake-price-id',
      amount: 'R$9.90',
    }
  
    render(<Home product={productProps} />)
  
    expect(screen.getByText('for $9.90 month')).toBeInTheDocument()
  })

  it('loads initial data', async () => {
    //imitar o funcionamento do stripe
    const retriveStripePricesMocked = jest.mocked(stripe.prices.retrieve)

    //imitar o retorno da função do stripe
    retriveStripePricesMocked.mockResolvedValueOnce({
      id: 'fake-price-id',
      unit_amount: 990
    } as any)

    const response = await getStaticProps({})

    //verificar a formatação dos dados retornados
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake-price-id',
            amount: '$9.90'
          }
        }
      })
    )

  })
})