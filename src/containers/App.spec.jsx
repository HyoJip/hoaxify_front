import React from "react";
import { fireEvent, render } from "@testing-library/react";
import App from "./App";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import axios from "axios";
import configureStore from "../redux/configureStore";
import * as apiCalls from "../api/apiCalls";

apiCalls.loadHoaxes = jest.fn().mockResolvedValue({
	data: {
		content: [],
		number: 0,
		size: 3,
	},
});

const mockSuccessGetUser1 = {
	data: {
		id: 1,
		username: "user1",
		displayName: "display1",
		image: "profile1.png",
	},
};

const mockSuccessGetUser2 = {
	data: {
		id: 2,
		username: "user2",
		displayName: "display2",
		image: "profile1.png",
	},
};

const mockFailGetUser = {
	data: {
		message: "User not found",
	},
};

const setUserOneLoggedInStorage = () => {
	localStorage.setItem(
		"hoax-auth",
		JSON.stringify({
			id: 1,
			username: "user1",
			displayName: "display1",
			image: "profile1.png",
			password: "P4ssword",
			isLoggedIn: true,
		})
	);
};

beforeEach(() => {
	localStorage.clear();
	delete axios.defaults.headers.common["Authorization"];
});

const setup = path => {
	const store = configureStore(false);
	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[path]}>
				<App />
			</MemoryRouter>
		</Provider>
	);
};

const changeEvent = content => {
	return {
		target: {
			value: content,
		},
	};
};

describe("App", () => {
	it("url(/) -> HomePage", () => {
		const { queryByTestId } = setup("/");
		expect(queryByTestId("homepage")).toBeInTheDocument();
	});
	it("url(/login) -> LoginPage", () => {
		const { container } = setup("/login");
		const header = container.querySelector("h1");
		expect(header).toHaveTextContent("Login");
	});
	it("url(/login) -> only LoginPage", () => {
		const { queryByTestId } = setup("/login");
		expect(queryByTestId("homepage")).not.toBeInTheDocument();
	});
	it("url(/signup) -> UserSignupPage", () => {
		const { container } = setup("/signup");
		const header = container.querySelector("h1");
		expect(header).toHaveTextContent("Sign Up");
	});
	it("url(/, /login, /signup) 아닐때 -> UserPage", () => {
		const { queryByTestId } = setup("/user1");
		expect(queryByTestId("userpage")).toBeInTheDocument();
	});

	it("url(/) nav 렌더링", () => {
		const { container } = setup("/");
		const nav = container.querySelector("nav");
		expect(nav).toBeInTheDocument();
	});
	it("url(/login) nav 렌더링", () => {
		const { container } = setup("/");
		const nav = container.querySelector("nav");
		expect(nav).toBeInTheDocument();
	});
	it("url(/signup) nav 렌더링", () => {
		const { container } = setup("/");
		const nav = container.querySelector("nav");
		expect(nav).toBeInTheDocument();
	});
	it("url(/user1) nav 렌더링", () => {
		const { container } = setup("/");
		const nav = container.querySelector("nav");
		expect(nav).toBeInTheDocument();
	});

	it("Sign Up 링크 클릭시 회원가입 페이지로 이동", () => {
		const { container, queryByText } = setup("/");
		const signupLink = queryByText("Sign Up");
		fireEvent.click(signupLink);
		const header = container.querySelector("h1");
		expect(header).toBeInTheDocument();
	});
	it("Login 링크 클릭시 회원가입 페이지로 이동", () => {
		const { container, queryByText } = setup("/");
		const LoginLink = queryByText("Login");
		fireEvent.click(LoginLink);
		const header = container.querySelector("h1");
		expect(header).toBeInTheDocument();
	});
	it("로고 클릭시 홈페이지로 이동", () => {
		const { container, queryByTestId } = setup("/login");
		const logo = container.querySelector("img");
		fireEvent.click(logo);
		expect(queryByTestId("homepage")).toBeInTheDocument();
	});

	it("로그인 후 My Profile 링크 렌더링", async () => {
		const { findByText, container, queryByPlaceholderText } = setup("/login");

		const usernameInput = queryByPlaceholderText("Your username");
		fireEvent.change(usernameInput, changeEvent("user1"));
		const passwordInput = queryByPlaceholderText("Your password");
		fireEvent.change(passwordInput, changeEvent("P4ssword"));
		const button = container.querySelector("button");
		axios.post = jest.fn().mockResolvedValue({
			data: {
				id: 1,
				username: "user1",
				displayName: "display1",
				image: "profile1.png",
			},
		});
		fireEvent.click(button);

		const myProfileLink = await findByText("My Profile");
		expect(myProfileLink).toBeInTheDocument();
	});

	it("회원가입 후 My Profile 링크 렌더링", async () => {
		const { queryByPlaceholderText, container, findByText } = setup("/signup");
		const displayNameInput = queryByPlaceholderText("Your Display Name");
		const usernameInput = queryByPlaceholderText("Your Username");
		const passwordInput = queryByPlaceholderText("Your Password");
		const passwordRepeatInput = queryByPlaceholderText("Repeat Your Password");

		fireEvent.change(displayNameInput, changeEvent("display1"));
		fireEvent.change(usernameInput, changeEvent("user1"));
		fireEvent.change(passwordInput, changeEvent("P4ssword"));
		fireEvent.change(passwordRepeatInput, changeEvent("P4ssword"));

		const button = container.querySelector("button");
		axios.post = jest
			.fn()
			.mockResolvedValueOnce({
				message: "USER CREATED",
			})
			.mockResolvedValueOnce({
				data: {
					id: 1,
					username: "user1",
					displayName: "display1",
					image: "profile1.png",
				},
			});

		fireEvent.click(button);

		const myProfileLink = await findByText("My Profile");
		expect(myProfileLink).toBeInTheDocument();
	});

	it("로그인 후 Local Storage에 회원 정보 저장", async () => {
		const { queryByPlaceholderText, container, findByText } = setup("/signup");
		const displayNameInput = queryByPlaceholderText("Your Display Name");
		const usernameInput = queryByPlaceholderText("Your Username");
		const passwordInput = queryByPlaceholderText("Your Password");
		const passwordRepeatInput = queryByPlaceholderText("Repeat Your Password");

		fireEvent.change(displayNameInput, changeEvent("display1"));
		fireEvent.change(usernameInput, changeEvent("user1"));
		fireEvent.change(passwordInput, changeEvent("P4ssword"));
		fireEvent.change(passwordRepeatInput, changeEvent("P4ssword"));

		const button = container.querySelector("button");
		axios.post = jest
			.fn()
			.mockResolvedValueOnce({
				message: "USER CREATED",
			})
			.mockResolvedValueOnce({
				data: {
					id: 1,
					username: "user1",
					displayName: "display1",
					image: "profile1.png",
				},
			});

		fireEvent.click(button);

		await findByText("My Profile");
		const dataInStorage = JSON.parse(localStorage.getItem("hoax-auth"));
		expect(dataInStorage).toEqual({
			id: 1,
			username: "user1",
			displayName: "display1",
			image: "profile1.png",
			password: "P4ssword",
			isLoggedIn: true,
		});
	});

	it("Local Storage 회원 정보로 My Profile 링크 렌더링", () => {
		setUserOneLoggedInStorage();
		const { queryByText } = setup("/");
		const myProfileLink = queryByText("My Profile");
		expect(myProfileLink).toBeInTheDocument();
	});

	it("로그인 후 회원 정보를 인코딩 후 axios 인증 헤더에 저장", async () => {
		const { queryByPlaceholderText, container, findByText } = setup("/signup");
		const displayNameInput = queryByPlaceholderText("Your Display Name");
		const usernameInput = queryByPlaceholderText("Your Username");
		const passwordInput = queryByPlaceholderText("Your Password");
		const passwordRepeatInput = queryByPlaceholderText("Repeat Your Password");

		fireEvent.change(displayNameInput, changeEvent("display1"));
		fireEvent.change(usernameInput, changeEvent("user1"));
		fireEvent.change(passwordInput, changeEvent("P4ssword"));
		fireEvent.change(passwordRepeatInput, changeEvent("P4ssword"));

		const button = container.querySelector("button");
		axios.post = jest
			.fn()
			.mockResolvedValueOnce({
				message: "USER CREATED",
			})
			.mockResolvedValueOnce({
				data: {
					id: 1,
					username: "user1",
					displayName: "display1",
					image: "profile1.png",
				},
			});

		fireEvent.click(button);

		await findByText("My Profile");
		const axiosAuthorization = axios.defaults.headers.common["Authorization"];

		const encoded = btoa("user1:P4ssword");
		const expectedAuthorization = `Basic ${encoded}`;
		expect(axiosAuthorization).toBe(expectedAuthorization);
	});

	it("Local Storage 회원 정보를 인코딩 후 axios 인증 헤더에 저장", () => {
		setUserOneLoggedInStorage();
		setup("/");
		const axiosAuthorization = axios.defaults.headers.common["Authorization"];
		const encoded = btoa("user1:P4ssword");
		const expectedAuthorization = `Basic ${encoded}`;
		expect(axiosAuthorization).toBe(expectedAuthorization);
	});

	it("로그아웃시 axios 인증 헤더 초기화", () => {
		setUserOneLoggedInStorage();
		const { queryByText } = setup("/");
		fireEvent.click(queryByText("Logout"));

		const axiosAuthorization = axios.defaults.headers.common["Authorization"];
		expect(axiosAuthorization).toBeFalsy();
	});
	it("다른 회원 상세 페이지에서 My Profile 클릭 시, 내 상세 페이지로 이동", async () => {
		apiCalls.getUser = jest
			.fn()
			.mockResolvedValueOnce(mockSuccessGetUser2)
			.mockResolvedValueOnce(mockSuccessGetUser1);
		setUserOneLoggedInStorage();
		const { queryByText, findByText } = setup("/user2");
		await findByText("display2@user2");
		const myProfileLink = queryByText("My Profile");
		fireEvent.click(myProfileLink);

		const userInfo = await findByText("display1@user1");
		expect(userInfo).toBeInTheDocument();
	});
	it("에러 페이지에서 My Profile 클릭 시, 내 상세 페이지로 이동", async () => {
		apiCalls.getUser = jest
			.fn()
			.mockRejectedValueOnce(mockFailGetUser)
			.mockResolvedValueOnce(mockSuccessGetUser1);
		setUserOneLoggedInStorage();
		const { queryByText, findByText } = setup("/user55");
		await findByText("User not found");
		const myProfileLink = queryByText("My Profile");
		fireEvent.click(myProfileLink);

		const userInfo = await findByText("display1@user1");
		expect(userInfo).toBeInTheDocument();
	});
});
