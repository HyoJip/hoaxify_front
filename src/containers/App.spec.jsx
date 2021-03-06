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
	it("url(/, /login, /signup) ????????? -> UserPage", () => {
		const { queryByTestId } = setup("/user1");
		expect(queryByTestId("userpage")).toBeInTheDocument();
	});

	it("url(/) nav ?????????", () => {
		const { container } = setup("/");
		const nav = container.querySelector("nav");
		expect(nav).toBeInTheDocument();
	});
	it("url(/login) nav ?????????", () => {
		const { container } = setup("/");
		const nav = container.querySelector("nav");
		expect(nav).toBeInTheDocument();
	});
	it("url(/signup) nav ?????????", () => {
		const { container } = setup("/");
		const nav = container.querySelector("nav");
		expect(nav).toBeInTheDocument();
	});
	it("url(/user1) nav ?????????", () => {
		const { container } = setup("/");
		const nav = container.querySelector("nav");
		expect(nav).toBeInTheDocument();
	});

	it("Sign Up ?????? ????????? ???????????? ???????????? ??????", () => {
		const { container, queryByText } = setup("/");
		const signupLink = queryByText("Sign Up");
		fireEvent.click(signupLink);
		const header = container.querySelector("h1");
		expect(header).toBeInTheDocument();
	});
	it("Login ?????? ????????? ???????????? ???????????? ??????", () => {
		const { container, queryByText } = setup("/");
		const LoginLink = queryByText("Login");
		fireEvent.click(LoginLink);
		const header = container.querySelector("h1");
		expect(header).toBeInTheDocument();
	});
	it("?????? ????????? ??????????????? ??????", () => {
		const { container, queryByTestId } = setup("/login");
		const logo = container.querySelector("img");
		fireEvent.click(logo);
		expect(queryByTestId("homepage")).toBeInTheDocument();
	});

	it("????????? ??? My Profile ?????? ?????????", async () => {
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

	it("???????????? ??? My Profile ?????? ?????????", async () => {
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

	it("????????? ??? Local Storage??? ?????? ?????? ??????", async () => {
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

	it("Local Storage ?????? ????????? My Profile ?????? ?????????", () => {
		setUserOneLoggedInStorage();
		const { queryByText } = setup("/");
		const myProfileLink = queryByText("My Profile");
		expect(myProfileLink).toBeInTheDocument();
	});

	it("????????? ??? ?????? ????????? ????????? ??? axios ?????? ????????? ??????", async () => {
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

	it("Local Storage ?????? ????????? ????????? ??? axios ?????? ????????? ??????", () => {
		setUserOneLoggedInStorage();
		setup("/");
		const axiosAuthorization = axios.defaults.headers.common["Authorization"];
		const encoded = btoa("user1:P4ssword");
		const expectedAuthorization = `Basic ${encoded}`;
		expect(axiosAuthorization).toBe(expectedAuthorization);
	});

	it("??????????????? axios ?????? ?????? ?????????", () => {
		setUserOneLoggedInStorage();
		const { queryByText } = setup("/");
		fireEvent.click(queryByText("Logout"));

		const axiosAuthorization = axios.defaults.headers.common["Authorization"];
		expect(axiosAuthorization).toBeFalsy();
	});
	it("?????? ?????? ?????? ??????????????? My Profile ?????? ???, ??? ?????? ???????????? ??????", async () => {
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
	it("?????? ??????????????? My Profile ?????? ???, ??? ?????? ???????????? ??????", async () => {
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
