import { fireEvent, render, screen } from "@testing-library/react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { SubscribeButton } from "."

jest.mock('next-auth/react')
jest.mock('next/router')

describe('SubscribeButton component', () => {
  //verificar se o botão "Subscribe Now" está renderizando com o usuário deslogado
  it('renders currectly', () => {

    //imitar o funcionamento do useSession
    const useSessionMocked = jest.mocked(useSession)

    //o usuário não está autenticado
    useSessionMocked.mockReturnValueOnce({ data: null, status: 'unauthenticated' })

    render(<SubscribeButton />)

    expect(screen.getByText('Subscribe Now')).toBeInTheDocument()
  })

  it('redirects user to sign in when not authenticated', () => {
    // 1 - O usuário não está logado
    // 2 - Quando o click no botão de subscribe for feito, a função de signIn deve ser chamada


    //imitar o funcionamento do signIn
    const signInMocked = jest.mocked(signIn)

    //para redirecionar o usuário caso ele não esteja logado é necessario
    //imitar o funcionamento de quando o usuário não está autenticado
    const useSessionMocked = jest.mocked(useSession)
    useSessionMocked.mockReturnValueOnce({ data: null, status: 'unauthenticated' })

    render(<SubscribeButton />)

    //pegar o botão atravez do seu texto
    const subscribeButton = screen.getByText('Subscribe Now')

    //disparar uma simulação de click no botão de subscribe
    fireEvent.click(subscribeButton)

    //o teste espera que a função de signIn tenha sido chamada
    expect(signInMocked).toHaveBeenCalled()
  })

  it('redirects to page posts when user already has a active subscription', () => {
    // 1 - O usuário está logado
    // 1 - O usuário tem uma subscription ativa
    // 1 - O usuário clica no botão "Subscription Now"
    // 1 - O usuário é redirecionado para a página de posts


    //imitar o funcionamento do useSession
    const useSessionMocked = jest.mocked(useSession)
    //imitar o funcionamento do useRouter
    const useRouterMocked = jest.mocked(useRouter)
    //disparar uma função sem retorno apenas para simulação
    const pushMock = jest.fn()

    //logar o usuário
    useSessionMocked.mockReturnValueOnce({
      data: {
        user: {
          name: 'John Doe',
          email: 'john.doe@exemple.com'
        },
        expires: 'fake-expires',
        activeSubscription: 'fake-active-subscription'
      }, status: 'authenticated'
    })

    //imitar o funcionamento de redirecionamento do "useRouter"
    useRouterMocked.mockReturnValueOnce({
      push: pushMock
    } as any);

    render(<SubscribeButton />)

    //localizar o botão "Subscription Now"
    const subscribeButton = screen.getByText('Subscribe Now')

    //clicar no botão "Subscription Now"
    fireEvent.click(subscribeButton)

    expect(pushMock).toHaveBeenCalledWith('/posts')
  })
})