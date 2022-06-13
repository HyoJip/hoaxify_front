import React from "react";
import { render } from "@testing-library/react";
import HomePage from "./HomePage";
import { Provider } from "react-redux";
import { createStore } from "redux";
import authReducer from "../redux/authReducer";

const defaultState = {
	id: 1,
	username: "user1",
	displayName: "displayName1",
	image: "profile1.png",
	password: "p4ssword",
	isLoggedIn: true,
};

let store;
const setup = (state = defaultState) => {
	store = createStore(authReducer, state);
	return render(
		<Provider store={store}>
			<HomePage />
		</Provider>
	);
};
describe("HomePage", () => {
	describe("Layout", () => {
		it("홈페이지 div", () => {
			const { queryByTestId } = setup();
			const homePageDiv = queryByTestId("homepage");
			expect(homePageDiv).toBeInTheDocument();
		});
		it("로그인 상태에서 hoax 표시", () => {
			const { container } = setup();
			const textarea = container.querySelector("textarea");
			expect(textarea).toBeInTheDocument();
		});
		it("로그아웃 상태에서는 hoax 미표시", () => {
			const notLoggedInState = {
				id: 0,
				username: "",
				displayName: "",
				image: "",
				password: "",
				isLoggedIn: false,
			};
			const { container } = setup(notLoggedInState);
			const textarea = container.querySelector("textarea");
			expect(textarea).not.toBeInTheDocument();
		});
	});
});
