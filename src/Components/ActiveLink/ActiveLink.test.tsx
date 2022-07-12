import { render, screen } from "@testing-library/react";
import { ActiveLink } from ".";

//Mock's são imitações
//Nesse caso estamos imitando o hook useRouter que está sendo utilizado pelo componente activeLink
//Testes unitários não conseguem acessar conteúdos externos, por isso precisamos simular essas funcionalodades
jest.mock("next/router", () => {
  return {
    useRouter() {
      return {
        asPath: "/",
      };
    },
  };
});

describe("ActiveLink component", () => {
  //construção do test e o que deve acontecer
  it("should renders correctly", () => {
    render(
      <ActiveLink href="/" activeClass="active">
        <a>Home</a>
      </ActiveLink>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should receivid an class active when link is currently active ", () => {
    render(
      <ActiveLink href="/" activeClass="active">
        <a>Home</a>
      </ActiveLink>
    );

    expect(screen.getByText("Home")).toHaveClass("active");
  });
});
