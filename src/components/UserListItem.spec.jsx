import React from "react";
import { render } from "@testing-library/react";
import UserListItem from "./UserListItem";
import { MemoryRouter } from "react-router-dom";

const user = {
	username: "user1",
	displayName: "display1",
	image: "profile1.png",
};

const setup = (propUser = user) => {
	return render(
		<MemoryRouter>
			<UserListItem user={propUser} />
		</MemoryRouter>
	);
};

describe("UserListItem", () => {
	it("이미지 렌더링", () => {
		const { container } = setup();
		const image = container.querySelector("img");
		expect(image).toBeInTheDocument();
	});
	it("회원 이미지가 없을 경우 기본 이미지 렌더링", () => {
		const userWithoutImage = {
			...user,
			image: undefined,
		};
		const { container } = setup(userWithoutImage);
		const image = container.querySelector("img");
		expect(image.src).toContain("/profile.png");
	});
	it("회원 이미지가 있는 경우 회원 이미지 렌더링", () => {
		const { container } = setup();
		const image = container.querySelector("img");
		expect(image.src).toContain("/images/profile/" + user.image);
	});
});
