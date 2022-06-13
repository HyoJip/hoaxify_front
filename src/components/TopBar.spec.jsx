import React from "react";
import { fireEvent, render } from "@testing-library/react";
import TopBar from "./TopBar";
import { MemoryRouter } from "react-router-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import authReducer from "../redux/authReducer";
import * as authActions from "../redux/authActions";

const loggedInState = {
	id: 1,
	username: "user1",
	displayName: "displayName1",
	image: "profile1.png",
	password: "p4ssword",
	isLoggedIn: true,
};

const defaultState = {
	id: 0,
	username: "",
	displayName: "",
	image: "",
	password: "",
	isLoggedIn: false,
};

let store;
const setup = (state = defaultState) => {
	store = createStore(authReducer, state);
	return render(
		<Provider store={store}>
			<MemoryRouter>
				<TopBar />
			</MemoryRouter>
		</Provider>
	);
};

describe("TopBar", () => {
	describe("Layout", () => {
		it("로고 이미지 렌더링", () => {
			const { container } = setup();
			const logo = container.querySelector("img");
			expect(logo.src).toContain("logo192.png");
		});
		it("로고 홈페이지 링크 렌더링", () => {
			const { container } = setup();
			const logo = container.querySelector("img");
			expect(logo.parentElement.getAttribute("href")).toBe("/");
		});
		it("회원가입 링크 렌더링", () => {
			const { queryByText } = setup();
			const signupLink = queryByText("Sign Up");
			expect(signupLink.getAttribute("href")).toBe("/signup");
		});
		it("로그인 링크 렌더링", () => {
			const { queryByText } = setup();
			const LoginLink = queryByText("Login");
			expect(LoginLink.getAttribute("href")).toBe("/login");
		});
		it("로그인 상태에서 로그아웃 링크 렌더링", () => {
			const { queryByText } = setup(loggedInState);
			const logoutLink = queryByText("Logout");
			expect(logoutLink).toBeInTheDocument();
		});
		it("로그인 상태에서 프로필 링크 렌더링", () => {
			const { queryByText } = setup(loggedInState);
			const profileLink = queryByText("My Profile");
			expect(profileLink).toBeInTheDocument();
		});
		it("로그인 상태에서 displayName 렌더링", () => {
			const { queryByText } = setup(loggedInState);
			const displayNameLink = queryByText(loggedInState.displayName);
			expect(displayNameLink).toBeInTheDocument();
		});
		it("로그인 상태에서 회원 프로필 이미지 렌더링", () => {
			const { container } = setup(loggedInState);
			const userImage = container.querySelectorAll("img")[1];
			expect(userImage.src).toContain("/images/profile/" + loggedInState.image);
		});
	});

	describe("Interactions", () => {
		it("Logout 링크 클릭시 login, singup 링크 렌더링", () => {
			const { queryByText } = setup(loggedInState);
			const logoutLink = queryByText("Logout");
			fireEvent.click(logoutLink);

			const loginLink = queryByText("Login");
			expect(loginLink).toBeInTheDocument();
		});
		it("드롭다운 메뉴 클릭시 하위 메뉴 렌더링", () => {
			const { queryByText, queryByTestId } = setup(loggedInState);
			const displayName = queryByText(loggedInState.displayName);
			fireEvent.click(displayName);
			const dropDownMenu = queryByTestId("drop-down-menu");
			expect(dropDownMenu).toHaveClass("show");
		});
		it("로고 클릭시 드롭다운 하위 메뉴 사라짐", () => {
			const { queryByText, queryByTestId, container } = setup(loggedInState);
			const displayName = queryByText(loggedInState.displayName);
			fireEvent.click(displayName);

			const logo = container.querySelector("img");
			fireEvent.click(logo);

			const dropDownMenu = queryByTestId("drop-down-menu");
			expect(dropDownMenu).not.toHaveClass("show");
		});
		it("로그아웃시 드롭다운 하위 메뉴 사라짐", () => {
			const { queryByText, queryByTestId } = setup(loggedInState);
			const displayName = queryByText(loggedInState.displayName);
			fireEvent.click(displayName);

			fireEvent.click(queryByText("Logout"));

			store.dispatch(authActions.loginSuccess(loggedInState));
			const dropDownMenu = queryByTestId("drop-down-menu");
			expect(dropDownMenu).not.toHaveClass("show");
		});
		it("My Profile 클릭시 드롭다운 하위 메뉴 사라짐", () => {
			const { queryByText, queryByTestId } = setup(loggedInState);
			const displayName = queryByText(loggedInState.displayName);
			fireEvent.click(displayName);

			fireEvent.click(queryByText("My Profile"));

			const dropDownMenu = queryByTestId("drop-down-menu");
			expect(dropDownMenu).not.toHaveClass("show");
		});
	});
});
