import React from "react";
import { fireEvent, render } from "@testing-library/react";
import ProfileImageWithDefault from "./ProfileImageWithDefault";

describe("ProfileImageWithDefault", () => {
	describe("Layout", () => {
		it("Image", () => {
			const { container } = render(<ProfileImageWithDefault />);
			const image = container.querySelector("img");
			expect(image).toBeInTheDocument();
		});
		it("image 프로퍼티가 없으면 기본 이미지", () => {
			const { container } = render(<ProfileImageWithDefault />);
			const image = container.querySelector("img");
			expect(image.src).toContain("/profile.png");
		});
		it("image 프로퍼티가 있으면 회원 이미지", () => {
			const { container } = render(<ProfileImageWithDefault image="profile1.png" />);
			const image = container.querySelector("img");
			expect(image.src).toContain("/images/profile/profile1.png");
		});
		it("image 값 로드에 실패시, 기본 이미지", () => {
			const { container } = render(<ProfileImageWithDefault image="profile1.png" />);
			const image = container.querySelector("img");
			fireEvent.error(image);
			expect(image.src).toContain("/profile.png");
		});
		it("src 프로퍼티를 통해 이미지 보여짐", () => {
			const { container } = render(<ProfileImageWithDefault src="image-from-src.png" />);
			const image = container.querySelector("img");
			expect(image.src).toContain("/image-from-src.png");
		});
	});
});
