import React from "react";
import { render } from "@testing-library/react";
import ProfileCard from "./ProfileCard";

const user = {
	id: 1,
	username: "user1",
	displayName: "display1",
	image: "profile1.png",
};

const userWithoutImage = {
	id: 1,
	username: "user1",
	displayName: "display1",
	image: "",
};

const setup = (userSet = user, props) => {
	return render(<ProfileCard user={userSet} {...props} />);
};

describe("ProfileCard", () => {
	describe("Layout", () => {
		it("displayName@username", () => {
			const { queryByText } = setup();
			const userInfo = queryByText("display1@user1");
			expect(userInfo).toBeInTheDocument();
		});
		it("userImage", () => {
			const { container } = setup();
			const image = container.querySelector("img");
			expect(image).toBeInTheDocument();
		});
		it("userImage 없는 회원은 기본 프로필 이미지", () => {
			const { container } = setup(userWithoutImage);
			const image = container.querySelector("img");
			expect(image.src).toContain("/profile.png");
		});
		it("userImage 있는 회원은 회원 프로필 이미지", () => {
			const { container } = setup();
			const image = container.querySelector("img");
			expect(image.src).toContain("/images/profile/" + user.image);
		});
		it("만약 (isEditable === true) 수정 버튼 표시", () => {
			const { queryByText } = setup(user, { isEditable: true });
			const editButton = queryByText("Edit");
			expect(editButton).toBeInTheDocument();
		});
		it("만약 (isEditable === false || undefine) 수정 버튼 숨김", () => {
			const { queryByText } = setup();
			const editButton = queryByText("Edit");
			expect(editButton).not.toBeInTheDocument();
		});
		it("수정모드일 때 displayName Input 표시", () => {
			const { container } = setup(user, { inEditMode: true });
			const displayInput = container.querySelector("input");
			expect(displayInput).toBeInTheDocument();
		});
		it("수정모드일 때 Input에 현재 displayName 표시", () => {
			const { container } = setup(user, { inEditMode: true });
			const displayInput = container.querySelector("input");
			expect(displayInput.value).toBe(user.displayName);
		});
		it("수정모드일 때 displayName@username 숨김", () => {
			const { queryByText } = setup(user, { inEditMode: true });
			const userInfo = queryByText("display1@user1");
			expect(userInfo).not.toBeInTheDocument();
		});
		it("수정모드일 때 display Label 표시", () => {
			const { container } = setup(user, { inEditMode: true });
			const label = container.querySelector("label");
			expect(label).toBeInTheDocument();
		});
		it("수정가능, 수정모드일 때 수정 버튼 숨김", () => {
			const { queryByText } = setup(user, { inEditMode: true, isEditable: true });
			const button = queryByText("Edit");
			expect(button).not.toBeInTheDocument();
		});
		it("수정가능, 수정모드일 때 저장 버튼 표시", () => {
			const { queryByText } = setup(user, { inEditMode: true, isEditable: true });
			const button = queryByText("Save");
			expect(button).toBeInTheDocument();
		});
		it("수정가능, 수정모드일 때 취소 버튼 표시", () => {
			const { queryByText } = setup(user, { inEditMode: true, isEditable: true });
			const button = queryByText("Cancel");
			expect(button).toBeInTheDocument();
		});
		it("수정모드일 때 파일 인풋 표시", () => {
			const { container } = setup(user, { inEditMode: true });
			const inputs = container.querySelectorAll("input");
			const uploadInput = inputs[1];
			expect(uploadInput.type).toBe("file");
		});
	});
});
