import React from "react";
import { fireEvent, render } from "@testing-library/react";
import HoaxView from "./HoaxView";
import { MemoryRouter } from "react-router-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import authReducer from "../redux/authReducer";

const loggedInStateUser1 = {
	id: 1,
	username: "user1",
	displayName: "displayName1",
	image: "profile1.png",
	password: "p4ssword",
	isLoggedIn: true,
};

const loggedInStateUser2 = {
	id: 2,
	username: "user2",
	displayName: "displayName2",
	image: "profile2.png",
	password: "p4ssword",
	isLoggedIn: true,
};

const hoaxWithoutAttachment = {
	id: 10,
	content: "This is the first hoax",
	user: {
		id: 1,
		username: "user1",
		displayName: "display1",
		image: "profile1.png",
	},
};

const hoaxWithAttachment = {
	id: 10,
	content: "This is the first hoax",
	user: {
		id: 1,
		username: "user1",
		displayName: "display1",
		image: "profile1.png",
	},
	attachment: {
		fileType: "image/png",
		name: "attached-image.png",
	},
};

const hoaxWithPdfAttachment = {
	id: 10,
	content: "This is the first hoax",
	user: {
		id: 1,
		username: "user1",
		displayName: "display1",
		image: "profile1.png",
	},
	attachment: {
		fileType: "application/pdf",
		name: "attached.pdf",
	},
};

const setup = (hoax = hoaxWithoutAttachment, state = loggedInStateUser1) => {
	const oneMinute = 60 * 1000;
	const date = new Date(new Date() - oneMinute);
	hoax.date = date;
	const store = createStore(authReducer, state);
	return render(
		<Provider store={store}>
			<MemoryRouter>
				<HoaxView hoax={hoax} />
			</MemoryRouter>
		</Provider>
	);
};

describe("HoaxView", () => {
	describe("Layout", () => {
		it("hoax 내용 표시", () => {
			const { queryByText } = setup();
			expect(queryByText("This is the first hoax")).toBeInTheDocument();
		});
		it("회원 프로필 이미지 표시", () => {
			const { container } = setup();
			const image = container.querySelector("img");
			expect(image.src).toContain("profile1.png");
		});
		it("회원 displayName@Username 이미지 표시", () => {
			const { queryByText } = setup();
			const info = queryByText("display1@user1");
			expect(info).toBeInTheDocument();
		});
		it("hoax 생성시간 표시", () => {
			const { queryByText } = setup();
			const time = queryByText("1 minute ago");
			expect(time).toBeInTheDocument();
		});
		it("userpage로 링크", () => {
			const { container } = setup();
			const anchor = container.querySelector("a");
			expect(anchor.getAttribute("href")).toBe("/user1");
		});
		it("attachment 이미지 파일 보여줌", () => {
			const { container } = setup(hoaxWithAttachment);
			const images = container.querySelectorAll("img");
			expect(images.length).toBe(2);
		});
		it("attachment가 이미지 파일이 아닐 경우 보여주지 않음", () => {
			const { container } = setup(hoaxWithPdfAttachment);
			const images = container.querySelectorAll("img");
			expect(images.length).toBe(1);
		});
		it("attachment src 설정", () => {
			const { container } = setup(hoaxWithAttachment);
			const images = container.querySelectorAll("img");
			const attachmentImage = images[1];
			expect(attachmentImage.src).toContain(
				"/images/attachments/" + hoaxWithAttachment.attachment.name
			);
		});
		it("로그인한 회원의 hoax에 삭제버튼 표시", () => {
			const { container } = setup();
			expect(container.querySelector("button")).toBeInTheDocument();
		});
		it("로그인한 회원의 hoax가 아니면 삭제버튼 표시 X", () => {
			const { container } = setup(hoaxWithoutAttachment, loggedInStateUser2);
			expect(container.querySelector("button")).not.toBeInTheDocument();
		});
		it("클릭 안했을 때는 드롭다운 메뉴 X", () => {
			const { queryByTestId } = setup();
			const dropDownMenu = queryByTestId("hoax-action-dropdown");
			expect(dropDownMenu).not.toHaveClass("show");
		});
		it("클릭시 드롭다운 메뉴 O", () => {
			const { queryByTestId } = setup();
			const indicator = queryByTestId("hoax-actions");
			fireEvent.click(indicator);
			const dropDownMenu = queryByTestId("hoax-action-dropdown");
			expect(dropDownMenu).toHaveClass("show");
		});
	});
});
