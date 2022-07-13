import { render, screen } from "@testing-library/react";
import { getSession } from "next-auth/react";
import { getPrismicClient } from "../../services/prismic";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";

jest.mock("next-auth/react");
jest.mock("../../services/prismic");

const post = {
  slug: "fake-slug",
  title: "Fake post title",
  content: "<p>Fake post content</p>",
  createdAt: "01 de Abril 2022",
};

describe("Post page", () => {
  it("Renders correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText("Fake post title")).toBeInTheDocument();
    expect(screen.getByText("Fake post content")).toBeInTheDocument();
  });

  it("redirects user if no subscription was found", async () => {
    //1 - Usuário deslogado deve ser redirecionado para a página principal
    //2 - Usúario não está logado
    //3 - Usuário será redirecionado por não estar logado

    //imitando o funcionamento do getSession
    const getSessionMocked = jest.mocked(getSession);

    //retornando o valor da subscription para simular que o usuário não está logado
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    } as any);

    const response = await getServerSideProps({
      params: { slug: "fake-slug" },
    } as any);

    //testando se o redirecionamento do usuário deslogado está funcionando
    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/",
        }),
      })
    );
  });

  it("should loads the initial data if user is authenticated", async () => {
    //1 - Usuário deve estar logado para ter acesso a página
    //2 - Mostrar os dados caso o usuário tenha uma assinatura ativa

    //imitar o funcionamento do getSession
    const getSessionMocked = jest.mocked(getSession);

    //imitar o funcionamento do prismic
    const getPrismicClientMocked = jest.mocked(getPrismicClient);

    //imitar o funcionamento de um usuário logados
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: "fake-active-subscription",
    } as any);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "Fake post title" }],
          content: [{ type: "paragraph", text: "Fake post content", spans: [] }],
        },
        last_publication_date: "04-01-2022",
      }),
    } as any);

    const response = await getServerSideProps({
      params: { slug: "fake-slug" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "fake-slug",
            title: "Fake post title",
            content: "<p>Fake post content</p>",
            createdAt: "01 de abril de 2022",
          },
        },
      })
    );
  });
});
