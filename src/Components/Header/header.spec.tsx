import { render, screen } from "@testing-library/react";
import { Header } from ".";

jest.mock("next/router", () => {
  return {
    useRouter() {
      return {
        asPath: "/"
      }
    }
  }
})

jest.mock("next-auth/react", () => {
  return {
    useSession() {
      return [null, false]
    }
  }
})

describe("Header Component0", () => {
  it("should render currectly", () => {
    render(<Header />);

    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Posts")).toBeInTheDocument()
  });
});
