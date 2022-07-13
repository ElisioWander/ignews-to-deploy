import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getPrismicClient } from "../../services/prismic"
import PostPreview, { getStaticProps } from "../../pages/posts/preview/[slug]";
import Post from "../../pages/posts/[slug]";

const post = {
  slug: "fake-slug",
  title: "Fake post title",
  content: "Fake post content",
  createdAt: "1 de abril 2022",
};

jest.mock('next-auth/react');
jest.mock('next/router');
jest.mock("../../services/prismic");

describe("PostPreview Page", () => {
  //verificar se está sendo renderizado corretamente
  it("renders correctly", () => {
    //1 - Para ter acesso a essa página o usuário não pode ter uma assinatura ativa

    //imitar o funcionamento do useSession
    const useSessionMocked = jest.mocked(useSession);
    //estabelecer que o usuário não está logado
    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
    });

    render(<PostPreview post={post} />);

    expect(screen.getByText("Fake post title"));
    expect(screen.getByText("Fake post content"));
    expect(screen.getByText("Wanna continue reading?"));
  });

  it("redirects to full post if user has a active subscription", () => {
    //2 - Usuário precisa ter uma subscription ativa
    //3 - Redirecionar usuário que tem uma subscription ativa para o post completo

    //imitar funcionamento do useSession
    const useSessionMocked = jest.mocked(useSession)

    //imitar funcionamento do useRouter
    const useRouterMocked = jest.mocked(useRouter)

    //criar uma função que vai representar o router.push
    const pushMock = jest.fn()

    //estabelecer uma assinatura ativa
    useSessionMocked.mockReturnValueOnce({
      data: { 
        activeSubscription: 'fake-active-subscription',
        expires: 'fake-expires'
      },
    } as any)

    //chamar o router.push após verificar que o usuário tem uma inscrição ativa
    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    //renderizar a página que o usuário será redirecionado
    render(<Post post={post} />);

    expect(pushMock).toHaveBeenCalledWith('/posts/fake-slug')
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient)
    
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "Fake post title" }],
          content: [{ type: "paragraph", text: "Fake post content", spans: [] }],
        },
        last_publication_date: "04-01-2022",
      })
    } as any)

    const response = await getStaticProps({ params: { slug: 'fake-slug' } })

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'fake-slug',
            title: 'Fake post title',
            content: '<p>Fake post content</p>',
            createdAt: '01 de abril de 2022'
          }
        }
      })
    )
  })
});
