import { render, screen } from "@testing-library/react"
import { SignInButton } from "."
import { useSession } from "next-auth/react"

jest.mock("next-auth/react")

describe("SignInButton Component", () => {
  it("should render currectly when user is not authenticated", () => {
    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce({data: null, status: 'unauthenticated'})

    render(<SignInButton />)

    expect(screen.getByText("Sign in with Github")).toBeInTheDocument()
  })

  it("should render currectly when user is authenticated", () => {
    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce({data: { 
      expires: 'fake-expires',
      user: { name: 'John Doe', email: 'john.doe@exemple.com' } 
    } , status: 'authenticated'})

    render(<SignInButton />)

    expect(screen.getByText("John Doe"))
  })
})