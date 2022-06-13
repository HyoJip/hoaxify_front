import React from "react";
import { render, fireEvent, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import { UserSignupPage } from "./UserSignupPage";

describe("UserSignupPage", () => {
	describe("Layout", () => {
		it("has header of Sign Up", () => {
			const { container } = render(<UserSignupPage />);
			const header = container.querySelector("h1");
			expect(header).toHaveTextContent("Sign Up");
		});

		it("has input for display name", () => {
			const { queryByPlaceholderText } = render(<UserSignupPage />);
			const displayNameInput = queryByPlaceholderText("Your Display Name");
			expect(displayNameInput).toBeInTheDocument();
		});

		it("has input for username", () => {
			const { queryByPlaceholderText } = render(<UserSignupPage />);
			const usernameInput = queryByPlaceholderText("Your Username");
			expect(usernameInput).toBeInTheDocument();
		});

		it("has input for password", () => {
			const { queryByPlaceholderText } = render(<UserSignupPage />);
			const passwordInput = queryByPlaceholderText("Your Password");
			expect(passwordInput).toBeInTheDocument();
		});
		it("has password type for password input", () => {
			const { queryByPlaceholderText } = render(<UserSignupPage />);
			const passwordInput = queryByPlaceholderText("Your Password");
			expect(passwordInput.type).toBe("password");
		});
		it("has input for password repeat", () => {
			const { queryByPlaceholderText } = render(<UserSignupPage />);
			const passwordInput = queryByPlaceholderText("Repeat Your Password");
			expect(passwordInput).toBeInTheDocument();
		});
		it("has password type for password repeat input", () => {
			const { queryByPlaceholderText } = render(<UserSignupPage />);
			const passwordInput = queryByPlaceholderText("Repeat Your Password");
			expect(passwordInput.type).toBe("password");
		});
		it("has button for submit", () => {
			const { container } = render(<UserSignupPage />);
			const button = container.querySelector("button");
			expect(button.type).toBe("submit");
		});
	});
	describe("Interactions", () => {
		const changeEvent = content => {
			return {
				target: {
					value: content,
				},
			};
		};

		let button, displayNameInput, usernameInput, passwordInput, passwordRepeatInput;
		const setupForSubmit = props => {
			const rendered = render(<UserSignupPage {...props} />);
			const { container, queryByPlaceholderText } = rendered;

			displayNameInput = queryByPlaceholderText("Your Display Name");
			usernameInput = queryByPlaceholderText("Your Username");
			passwordInput = queryByPlaceholderText("Your Password");
			passwordRepeatInput = queryByPlaceholderText("Repeat Your Password");

			fireEvent.change(displayNameInput, changeEvent("My-display-name"));
			fireEvent.change(usernameInput, changeEvent("My-username"));
			fireEvent.change(passwordInput, changeEvent("My-Password"));
			fireEvent.change(passwordRepeatInput, changeEvent("My-Password"));

			button = container.querySelector("button");
			return rendered;
		};

		const mockAsyncDelayed = () => {
			return jest.fn(
				() => new Promise((resolve, reject) => setTimeout(() => resolve({}), 300))
			);
		};

		it("sets the dispalyName value into state", () => {
			const { queryByPlaceholderText } = render(<UserSignupPage />);
			const displayNameInput = queryByPlaceholderText("Your Display Name");
			fireEvent.change(displayNameInput, changeEvent("My-display-name"));

			expect(displayNameInput).toHaveValue("My-display-name");
		});

		it("sets the username value into state", () => {
			const { queryByPlaceholderText } = render(<UserSignupPage />);
			const usernameInput = queryByPlaceholderText("Your Username");
			fireEvent.change(usernameInput, changeEvent("My-username"));

			expect(usernameInput).toHaveValue("My-username");
		});

		it("sets the password value into state", () => {
			const { queryByPlaceholderText } = render(<UserSignupPage />);
			const passwordInput = queryByPlaceholderText("Your Password");
			fireEvent.change(passwordInput, changeEvent("My-Password"));

			expect(passwordInput).toHaveValue("My-Password");
		});

		it("sets the password repeat value into state", () => {
			const { queryByPlaceholderText } = render(<UserSignupPage />);
			const passwordRepeatInput = queryByPlaceholderText("Repeat Your Password");
			fireEvent.change(passwordRepeatInput, changeEvent("My-Password"));

			expect(passwordRepeatInput).toHaveValue("My-Password");
		});

		it("calls postSignup when the fields are valid and the actions are provided in props", () => {
			const actions = {
				postSignup: jest.fn().mockResolvedValueOnce({}),
			};
			setupForSubmit({ actions });
			fireEvent.click(button);
			expect(actions.postSignup).toHaveBeenCalledTimes(1);
		});

		it("does not throw exception when clicking the button with not provided actions props", () => {
			setupForSubmit();
			expect(() => fireEvent.click(button)).not.toThrow();
		});

		it("calls posts with user body when the fields are vaild", () => {
			const actions = {
				postSignup: jest.fn().mockResolvedValueOnce({}),
			};
			setupForSubmit({ actions });
			fireEvent.click(button);

			const expectedUserObject = {
				displayName: "My-display-name",
				username: "My-username",
				password: "My-Password",
			};
			expect(actions.postSignup).toHaveBeenCalledWith(expectedUserObject);
		});

		it("does not allow user to click the Signup button when there is an ongoing api call", () => {
			const actions = {
				postSignup: mockAsyncDelayed(),
			};
			setupForSubmit({ actions });

			fireEvent.click(button);
			fireEvent.click(button);
			expect(actions.postSignup).toHaveBeenCalledTimes(1);
		});

		it("display spinner while there is an ongoing api call", () => {
			const actions = {
				postSignup: mockAsyncDelayed(),
			};
			const { queryByText } = setupForSubmit({ actions });
			fireEvent.click(button);

			const spinner = queryByText("Loading...");

			expect(spinner).toBeInTheDocument();
		});

		it("hide spinner after api call finishes successfully", async () => {
			const actions = {
				postSignup: mockAsyncDelayed(),
			};
			const { queryByText, findByText } = setupForSubmit({ actions });
			fireEvent.click(button);
			await findByText("Loading...");
			await waitFor(() => expect(queryByText("Loading...")).not.toBeInTheDocument());
		});

		it("hide spinner after api call finishes with error", async () => {
			const actions = {
				postSignup: jest.fn(
					() =>
						new Promise((resolve, reject) =>
							setTimeout(() => reject({ response: { data: {} } }), 300)
						)
				),
			};
			const { queryByText } = setupForSubmit({ actions });
			fireEvent.click(button);

			await waitFor(() => expect(queryByText("Loading...")).not.toBeInTheDocument());
		});

		it("displays validation error for displayName when error is received for the field", async () => {
			const actions = {
				postSignup: jest.fn().mockRejectedValue({
					response: {
						data: {
							validationErrors: {
								displayName: "Cannot be null",
							},
						},
					},
				}),
			};
			const { findByText } = setupForSubmit({ actions });
			fireEvent.click(button);
			const errorMessage = await findByText("Cannot be null");
			expect(errorMessage).toBeInTheDocument();
		});

		it("enables the signup button when password and repeat pasword have same value", () => {
			setupForSubmit();
			expect(button).not.toBeDisabled();
		});

		it("disables the signup button when password and repeat pasword does not match to password", () => {
			setupForSubmit();
			fireEvent.change(passwordRepeatInput, changeEvent("new-pass"));
			expect(button).toBeDisabled();
		});

		it("disables the signup button when password and pasword does not match to repeate password", () => {
			setupForSubmit();
			fireEvent.change(passwordInput, changeEvent("new-pass"));
			expect(button).toBeDisabled();
		});

		it("displays error style for password repeat input when password repeat input mismatch", () => {
			const { queryByText } = setupForSubmit();
			fireEvent.change(passwordRepeatInput, changeEvent("new-pass"));
			const mismatchWarning = queryByText("Does not match to password");
			expect(mismatchWarning).toBeInTheDocument();
		});

		it("displays error style for password repeat input when password input mismatch", () => {
			const { queryByText } = setupForSubmit();
			fireEvent.change(passwordInput, changeEvent("new-pass"));
			const mismatchWarning = queryByText("Does not match to password");
			expect(mismatchWarning).toBeInTheDocument();
		});

		it("hides the validation error when user changes the content of displayName", async () => {
			const actions = {
				postSignup: jest.fn().mockRejectedValue({
					response: {
						data: {
							validationErrors: {
								displayName: "Cannot be null",
							},
						},
					},
				}),
			};
			const { findByText } = setupForSubmit({ actions });
			fireEvent.click(button);
			const errorMessage = await findByText("Cannot be null");
			fireEvent.change(displayNameInput, changeEvent("name updated"));

			expect(errorMessage).not.toBeInTheDocument();
		});

		it("hides the validation error when user changes the content of username", async () => {
			const actions = {
				postSignup: jest.fn().mockRejectedValue({
					response: {
						data: {
							validationErrors: {
								username: "Username cannot be null",
							},
						},
					},
				}),
			};
			const { findByText } = setupForSubmit({ actions });

			fireEvent.click(button);
			const errorMessage = await findByText("Username cannot be null");
			fireEvent.change(usernameInput, changeEvent("name updated"));

			expect(errorMessage).not.toBeInTheDocument();
		});

		it("hides the validation error when user changes the content of password", async () => {
			const actions = {
				postSignup: jest.fn().mockRejectedValue({
					response: {
						data: {
							validationErrors: {
								password: "Cannot be null",
							},
						},
					},
				}),
			};
			const { findByText } = setupForSubmit({ actions });
			fireEvent.click(button);
			const errorMessage = await findByText("Cannot be null");
			fireEvent.change(passwordInput, changeEvent("password updated"));

			expect(errorMessage).not.toBeInTheDocument();
		});

		it("회원가입이 완료되면 홈페이지로 이동", async () => {
			const actions = {
				postSignup: jest.fn().mockResolvedValue({}),
			};
			const history = {
				push: jest.fn(),
			};
			const { queryByText } = setupForSubmit({ actions, history });
			fireEvent.click(button);

			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			expect(history.push).toHaveBeenCalledWith("/");
		});
	});
});

console.error = () => {};
