import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import UserList from "./UserList";
import * as apiCalls from "../api/apiCalls";
import { MemoryRouter } from "react-router-dom";

const setup = () => {
	return render(
		<MemoryRouter>
			<UserList />
		</MemoryRouter>
	);
};

const mockedEmptySuccessResponse = {
	data: {
		content: [],
		number: 0,
		size: 3,
	},
};

const mockSuccessGetSinglePage = {
	data: {
		content: [
			{ username: "user1", displayName: "display1", image: "" },
			{ username: "user2", displayName: "display2", image: "" },
			{ username: "user3", displayName: "display3", image: "" },
		],
		size: 3,
		number: 0,
		first: true,
		last: true,
		totalPages: 1,
	},
};
const mockSuccessGetMultiPageFirst = {
	data: {
		content: [
			{ username: "user1", displayName: "display1", image: "" },
			{ username: "user2", displayName: "display2", image: "" },
			{ username: "user3", displayName: "display3", image: "" },
		],
		size: 3,
		number: 0,
		first: true,
		last: false,
		totalPages: 2,
	},
};
const mockSuccessGetMultiPageLast = {
	data: {
		content: [{ username: "user4", displayName: "display4", image: "" }],
		size: 3,
		number: 1,
		first: false,
		last: true,
		totalPages: 2,
	},
};

const mockFailGet = {
	data: {
		message: "Load Error",
	},
};

describe("UserList", () => {
	describe("Layout", () => {
		it("유저리스트 헤더", () => {
			const { container } = setup();
			const header = container.querySelector("h3");
			expect(header).toHaveTextContent("Users");
		});
		it("api 콜 결과 회원이 3명일 때, 3명만 표시", async () => {
			apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetSinglePage);
			const { findByTestId } = setup();
			const userGroup = await findByTestId("usergroup");
			expect(userGroup.childElementCount).toBe(3);
		});
		it("api 콜 결과, displayName@username 형태로 렌더링", async () => {
			apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetSinglePage);
			const { findByText } = setup();
			const firstUser = await findByText("display1@user1");
			expect(firstUser).toBeInTheDocument();
		});
		it("마지막 페이지가 아닐 때, 다음 버튼 렌더링", async () => {
			apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageFirst);
			const { findByText } = setup();
			const nextLink = await findByText("next >");
			expect(nextLink).toBeInTheDocument();
		});
		it("마지막 페이지일 때, 다음 버튼 숨김", async () => {
			apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageLast);
			const { findByText } = setup();
			const nextLink = await findByText("next >");
			expect(nextLink).not.toBeInTheDocument();
		});
		it("첫번째 페이지가 아닐 때, 이전 버튼 렌더링", async () => {
			apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageLast);
			const { findByText } = setup();
			const prevLink = await findByText("< prev");
			expect(prevLink).toBeInTheDocument();
		});
		it("첫번째 페이지일 때, 이전 버튼 숨김", async () => {
			apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetMultiPageFirst);
			const { findByText } = setup();
			const prevLink = await findByText("< prev");
			expect(prevLink).not.toBeInTheDocument();
		});
		it("userPage 링크", async () => {
			apiCalls.listUsers = jest.fn().mockResolvedValue(mockSuccessGetSinglePage);
			const { findByText, container } = setup();
			await findByText("display1@user1");
			const firstAnchor = container.querySelectorAll("a")[0];
			expect(firstAnchor.getAttribute("href")).toBe("/user1");
		});
	});

	describe("Lifecycle", () => {
		it("UserList 렌더링 시 api ListUser 콜", () => {
			apiCalls.listUsers = jest.fn().mockResolvedValue(mockedEmptySuccessResponse);
			setup();
			expect(apiCalls.listUsers).toHaveBeenCalledTimes(1);
		});
		it("page=0&size=3 으로 api ListUser콜", () => {
			apiCalls.listUsers = jest.fn().mockResolvedValue(mockedEmptySuccessResponse);
			setup();
			expect(apiCalls.listUsers).toHaveBeenCalledWith({ page: 0, size: 3 });
		});
	});
	describe("Interactions", () => {
		it("다음 버튼 클릭시 다음 페이지 로드", async () => {
			apiCalls.listUsers = jest
				.fn()
				.mockResolvedValueOnce(mockSuccessGetMultiPageFirst)
				.mockResolvedValueOnce(mockSuccessGetMultiPageLast);
			const { queryByText, findByText } = setup();
			const nextLink = queryByText("next >");
			fireEvent.click(nextLink);
			const secondPageUser = await findByText("display4@user4");

			expect(secondPageUser).toBeInTheDocument();
		});
		it("이전 버튼 클릭시 이전 페이지 로드", async () => {
			apiCalls.listUsers = jest
				.fn()
				.mockResolvedValueOnce(mockSuccessGetMultiPageLast)
				.mockResolvedValueOnce(mockSuccessGetMultiPageFirst);
			const { queryByText, findByText } = setup();
			const prevLink = queryByText("< prev");
			fireEvent.click(prevLink);
			const firstPageUser = await findByText("display1@user1");

			expect(firstPageUser).toBeInTheDocument();
		});
		it("api call 실패시 에러메시지 표시", async () => {
			apiCalls.listUsers = jest
				.fn()
				.mockResolvedValueOnce(mockSuccessGetMultiPageLast)
				.mockRejectedValueOnce(mockFailGet);
			const { queryByText, findByText } = setup();
			const prevLink = queryByText("< prev");
			fireEvent.click(prevLink);
			const errorMessage = await findByText("Load Error");

			expect(errorMessage).toBeInTheDocument();
		});
		it("api call 성공시 에러메시지 삭제", async () => {
			apiCalls.listUsers = jest
				.fn()
				.mockResolvedValueOnce(mockSuccessGetMultiPageLast)
				.mockRejectedValueOnce(mockFailGet)
				.mockResolvedValueOnce(mockSuccessGetMultiPageFirst);
			const { queryByText, findByText } = setup();
			const prevLink = queryByText("< prev");
			fireEvent.click(prevLink);
			const errorMessage = await findByText("Load Error");
			fireEvent.click(prevLink);

			await waitFor(() => {
				expect(errorMessage).not.toBeInTheDocument();
			});
		});
	});
});
