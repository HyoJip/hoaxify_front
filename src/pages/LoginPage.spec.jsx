import React from "react";
import { fireEvent, render, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
	describe("Layout", () => {
		it("로그인 헤더 렌더링", () => {
			const { container } = render(<LoginPage />);
			const header = container.querySelector("h1");
			expect(header).toHaveTextContent("Login");
		});

		it("username 인풋 렌더링", () => {
			const { queryByPlaceholderText } = render(<LoginPage />);
			const usernameInput = queryByPlaceholderText("Your username");
			expect(usernameInput).toBeInTheDocument();
		});

		it("password 인풋 렌더링", () => {
			const { queryByPlaceholderText } = render(<LoginPage />);
			const passwordInput = queryByPlaceholderText("Your password");
			expect(passwordInput).toBeInTheDocument();
		});

		it("password 인풋 type=password", () => {
			const { queryByPlaceholderText } = render(<LoginPage />);
			const passwordInput = queryByPlaceholderText("Your password");
			expect(passwordInput.type).toBe("password");
		});

		it("로그인 버튼 렌더링", () => {
			const { container } = render(<LoginPage />);
			const button = container.querySelector("button");
			expect(button).toBeInTheDocument();
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

		const mockAsyncDelayed = () => {
			return jest.fn(
				() => new Promise((resolve, reject) => setTimeout(() => resolve({}), 300))
			);
		};

		let usernameInput, passwordInput, button;
		const setupForSubmit = props => {
			const rendered = render(<LoginPage {...props} />);

			const { container, queryByPlaceholderText } = rendered;
			usernameInput = queryByPlaceholderText("Your username");
			fireEvent.change(usernameInput, changeEvent("my-username"));
			passwordInput = queryByPlaceholderText("Your password");
			fireEvent.change(passwordInput, changeEvent("P4ssword"));
			button = container.querySelector("button");
			return rendered;
		};

		it("username 인풋 값입력", () => {
			const { queryByPlaceholderText } = render(<LoginPage />);
			usernameInput = queryByPlaceholderText("Your username");
			fireEvent.change(usernameInput, changeEvent("my-username"));
			expect(usernameInput).toHaveValue("my-username");
		});

		it("password 인풋 값입력", () => {
			const { queryByPlaceholderText } = render(<LoginPage />);
			passwordInput = queryByPlaceholderText("Your password");
			fireEvent.change(passwordInput, changeEvent("P4ssword"));
			expect(passwordInput).toHaveValue("P4ssword");
		});

		it("액션 프로퍼티를 받으면 로그인요청", () => {
			const actions = {
				postLogin: jest.fn().mockResolvedValue({}),
			};

			setupForSubmit({ actions });
			fireEvent.click(button);
			expect(actions.postLogin).toHaveBeenCalledTimes(1);
		});

		it("액션 프로퍼티를 받지 않아도 에러페이지를 띄우지 않음", () => {
			setupForSubmit();
			fireEvent.click(button);
			expect(() => fireEvent.click(button)).not.toThrow();
		});

		it("로그인 요청시 인풋 값을 넘김", () => {
			const actions = {
				postLogin: jest.fn().mockResolvedValue({}),
			};
			setupForSubmit({ actions });
			fireEvent.click(button);

			const expectedUserObject = {
				username: "my-username",
				password: "P4ssword",
			};

			expect(actions.postLogin).toHaveBeenCalledWith(expectedUserObject);
		});

		it("usernameInput 값이 비어있으면 로그인 버튼 비활성화", () => {
			setupForSubmit();
			fireEvent.change(usernameInput, changeEvent(""));
			expect(button).toBeDisabled();
		});

		it("passwordInput 값이 비어있으면 로그인 버튼 비활성화", () => {
			setupForSubmit();
			fireEvent.change(passwordInput, changeEvent(""));
			expect(button).toBeDisabled();
		});

		it("모든 인풋에 값이 있으면 로그인 버튼 활성화", () => {
			setupForSubmit();
			expect(button).not.toBeDisabled();
		});

		it('로그인 실패시 "Login failed" 알림', async () => {
			const actions = {
				postLogin: jest.fn().mockRejectedValue({
					response: {
						data: {
							message: "Login failed",
						},
					},
				}),
			};

			const { getByText } = setupForSubmit({ actions });
			fireEvent.click(button);

			await waitFor(() => expect(getByText("Login failed")).toBeInTheDocument());
		});

		it("usernameInput 값이 변하면 에러메시지 삭제", async () => {
			const actions = {
				postLogin: jest.fn().mockRejectedValue({
					response: {
						data: {
							message: "Login failed",
						},
					},
				}),
			};

			const { findByText } = setupForSubmit({ actions });
			fireEvent.click(button);

			const alert = await findByText("Login failed");
			fireEvent.change(usernameInput, changeEvent("updated-username"));
			expect(alert).not.toBeInTheDocument();
		});

		it("passwordInput 값이 변하면 에러메시지 삭제", async () => {
			const actions = {
				postLogin: jest.fn().mockRejectedValue({
					response: {
						data: {
							message: "Login failed",
						},
					},
				}),
			};

			const { findByText } = setupForSubmit({ actions });
			fireEvent.click(button);

			const alert = await findByText("Login failed");
			fireEvent.change(passwordInput, changeEvent("updated-P4ssword"));
			expect(alert).not.toBeInTheDocument();
		});

		it("api 수신될동안 로그인 버튼 disabled", () => {
			const actions = {
				postLogin: mockAsyncDelayed(),
			};
			setupForSubmit({ actions });

			fireEvent.click(button);
			fireEvent.click(button);
			expect(actions.postLogin).toHaveBeenCalledTimes(1);
		});

		it("api 수신성공하면 로딩버튼 사라짐", async () => {
			const actions = {
				postLogin: mockAsyncDelayed(),
			};

			const { queryByText } = setupForSubmit({ actions });
			fireEvent.click(button);

			const spinner = queryByText("Loading...");
			await waitForElementToBeRemoved(spinner);
			expect(spinner).not.toBeInTheDocument();
		});

		it("api 수신실패하면 로딩버튼 사라짐", async () => {
			const actions = {
				postLogin: jest.fn(
					() =>
						new Promise((resolve, reject) =>
							setTimeout(() => reject({ response: { data: {} } }), 300)
						)
				),
			};
			const { queryByText } = setupForSubmit({ actions });
			fireEvent.click(button);

			const spinner = queryByText("Loading...");
			await waitForElementToBeRemoved(spinner);
			expect(spinner).not.toBeInTheDocument();
		});

		it("api 수신될동안 로딩버튼 나타남", async () => {
			const actions = {
				postLogin: mockAsyncDelayed(),
			};
			const { queryByText } = setupForSubmit({ actions });
			fireEvent.click(button);

			const spinner = queryByText("Loading...");
			expect(spinner).toBeInTheDocument();
		});

		it("로그인 후 홈페이지로 이동", async () => {
			const actions = {
				postLogin: jest.fn().mockResolvedValue({}),
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
