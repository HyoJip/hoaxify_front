import React from "react";
import { fireEvent, render, waitForElementToBeRemoved } from "@testing-library/react";
import HoaxFeed from "./HoaxFeed";
import * as apiCalls from "../api/apiCalls";
import { MemoryRouter } from "react-router-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import authReducer from "../redux/authReducer";

const loggedInState = {
	id: 1,
	username: "user1",
	displayName: "displayName1",
	image: "profile1.png",
	password: "p4ssword",
	isLoggedIn: true,
};

const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;

let timedFunction;

const useFakeIntervals = () => {
	window.setInterval = (callback, interval) => {
		if (!callback.toString().startsWith("function")) {
			timedFunction = callback;
			return 11111;
		}
	};
	window.clearInterval = id => {
		if (id === 11111) {
			timedFunction = undefined;
		}
	};
};

const useRealIntervals = () => {
	window.setInterval = originalSetInterval;
	window.clearInterval = originalClearInterval;
};

const runTimer = () => {
	timedFunction && timedFunction();
};

const setup = (props, state = loggedInState) => {
	const store = createStore(authReducer, state);
	return render(
		<Provider store={store}>
			<MemoryRouter>
				<HoaxFeed {...props} />
			</MemoryRouter>
		</Provider>
	);
};

const mockEmptyResponse = {
	data: {
		content: [],
	},
};

const mockSuccessGetNewHoaxesList = {
	data: [
		{
			id: 11,
			content: "This is the newest hoax",
			date: 1561294668539,
			user: {
				id: 1,
				username: "user1",
				displayName: "display1",
				image: "profile1.png",
			},
		},
	],
};

const mockSuccessGetHoaxesSinglePage = {
	data: {
		content: [
			{
				id: 10,
				content: "This is the lastes hoax",
				date: 1561294668539,
				user: {
					id: 1,
					username: "user1",
					displayName: "display1",
					image: "profile1.png",
				},
			},
		],
		number: 0,
		first: true,
		last: true,
		size: 5,
		totalPage: 1,
	},
};

const mockSuccessGetHoaxesFirstOfMultiPage = {
	data: {
		content: [
			{
				id: 10,
				content: "This is the lastest hoax",
				date: 1561294668539,
				user: {
					id: 1,
					username: "user1",
					displayName: "display1",
					image: "profile1.png",
				},
			},
			{
				id: 9,
				content: "This is the hoax 9",
				date: 1561294668539,
				user: {
					id: 1,
					username: "user1",
					displayName: "display1",
					image: "profile1.png",
				},
			},
		],
		number: 0,
		first: true,
		last: false,
		size: 5,
		totalPage: 2,
	},
};
const mockSuccessGetHoaxesMiddleOfMultiPage = {
	data: {
		content: [
			{
				id: 5,
				content: "This hoax is in middle page",
				date: 1561294668539,
				user: {
					id: 1,
					username: "user1",
					displayName: "display1",
					image: "profile1.png",
				},
			},
		],
		number: 0,
		first: false,
		last: false,
		size: 5,
		totalPage: 1,
	},
};
const mockSuccessGetHoaxesLastOfMultiPage = {
	data: {
		content: [
			{
				id: 1,
				content: "This is the oldest hoax",
				date: 1561294668539,
				user: {
					id: 1,
					username: "user1",
					displayName: "display1",
					image: "profile1.png",
				},
			},
		],
		number: 0,
		first: false,
		last: true,
		size: 5,
		totalPage: 2,
	},
};

describe("HoaxFeed", () => {
	describe("Lifecycle", () => {
		it("렌더링된 후 api call", () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
			setup();
			expect(apiCalls.loadHoaxes).toHaveBeenCalled();
		});
		it("username을 파라미터로 api call", () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
			setup({ username: "user1" });
			expect(apiCalls.loadHoaxes).toHaveBeenCalledWith("user1");
		});
		it("username 없이 api call", () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
			setup();
			const param = apiCalls.loadHoaxes.mock.calls[0][0];
			expect(param).toBeUndefined();
		});
		it("최신 Hoax id loadNewHoaxCount APIcall", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { findByText } = setup();
			await findByText("This is the lastest hoax");
			runTimer();
			await findByText("There is 1 new hoax");

			const firstParam = apiCalls.countNewHoaxes.mock.calls[0][0];
			expect(firstParam).toBe(10);
			useRealIntervals();
		});
		it("최신 Hoax id username loadNewHoaxCount APIcall", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { findByText } = setup({ username: "user1" });
			await findByText("This is the lastest hoax");
			runTimer();
			await findByText("There is 1 new hoax");

			expect(apiCalls.countNewHoaxes).toHaveBeenCalledWith(10, "user1");
			useRealIntervals();
		});
		it("count api call 성공시 count 표시", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { findByText } = setup({ username: "user1" });
			await findByText("This is the lastest hoax");
			runTimer();
			const newHoaxCount = await findByText("There is 1 new hoax");

			expect(newHoaxCount).toBeInTheDocument();
			useRealIntervals();
		});
		it("주기적으로 count api call", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { findByText } = setup({ username: "user1" });
			await findByText("This is the lastest hoax");
			runTimer();
			await findByText("There is 1 new hoax");
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 2 } });
			runTimer();
			const newHoaxCount = await findByText("There are 2 new hoaxes");

			expect(newHoaxCount).toBeInTheDocument();
			useRealIntervals();
		});
		it("unmounted 후 count call X", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { findByText, unmount } = setup({ username: "user1" });
			await findByText("This is the lastest hoax");
			runTimer();
			await findByText("There is 1 new hoax");
			unmount();
			runTimer();
			expect(apiCalls.countNewHoaxes).toHaveBeenCalledTimes(1);
			useRealIntervals();
		});
		it("userpage hoax가 하나도 없는 상태에서도 주기적으로 count api call", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { findByText, queryByText } = setup({ username: "user1" });
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			runTimer();
			const newHoaxCount = await findByText("There is 1 new hoax");

			expect(newHoaxCount).toBeInTheDocument();
			useRealIntervals();
		});
	});

	describe("Layout", () => {
		it("hoax가 없을 때 메시지 표시", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
			const { findByText } = setup();
			expect(await findByText("There are no hoaxes")).toBeInTheDocument();
		});
		it("hoax가 있을 때 에러 메시지 표시 X", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesSinglePage);
			const { queryByText } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			expect(queryByText("There are no hoaxes")).not.toBeInTheDocument();
		});
		it("hoax 로딩 중, spinner 표시", async () => {
			apiCalls.loadHoaxes = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve(mockSuccessGetHoaxesSinglePage);
					}, 300);
				});
			});
			const { queryByText } = setup();
			expect(queryByText("Loading...")).toBeInTheDocument();
		});
		it("hoax 내용 표시", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesSinglePage);
			const { queryByText } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			expect(queryByText("This is the lastes hoax")).toBeInTheDocument();
		});
		it("다음 페이지 있을 경우, Load More 표시", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			const { findByText } = setup();
			const loadMore = await findByText("Load More");
			expect(loadMore).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("LoadMore 버튼 클릭시, 페이지상 마지막 hoax Id로 커서페이징 api call", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.loadOldHoaxes = jest
				.fn()
				.mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
			const { findByText } = setup();
			const loadMore = await findByText("Load More");

			fireEvent.click(loadMore);
			const firstParam = apiCalls.loadOldHoaxes.mock.calls[0][0];
			expect(firstParam).toBe(9);
		});
		it("회원상세 페이지에서 LoadMore 버튼 클릭시, 페이지상 마지막 hoax Id로 커서페이징 api call", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.loadOldHoaxes = jest
				.fn()
				.mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
			const { findByText } = setup({ username: "user1" });
			const loadMore = await findByText("Load More");

			fireEvent.click(loadMore);
			expect(apiCalls.loadOldHoaxes).toHaveBeenCalledWith(9, "user1");
		});
		it("LoadMore 버튼 클릭시, 다음 페이지 표시", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.loadOldHoaxes = jest
				.fn()
				.mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
			const { findByText } = setup();
			const loadMore = await findByText("Load More");

			fireEvent.click(loadMore);
			const oldHoax = await findByText("This is the oldest hoax");
			expect(oldHoax).toBeInTheDocument();
		});
		it("마지막 페이지일 경우, LoadMore 표시 X", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.loadOldHoaxes = jest
				.fn()
				.mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
			const { findByText, queryByText } = setup();
			const loadMore = await findByText("Load More");

			fireEvent.click(loadMore);
			findByText("This is the oldest hoax");
			expect(queryByText("Load More")).not.toBeInTheDocument();
		});

		// 새로운 피드 로딩
		it("New Hoax Count Card 버튼 클릭시, loadNewHoaxes api call", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.loadNewHoaxes = jest.fn().mockResolvedValue(mockSuccessGetNewHoaxesList);
			const { findByText } = setup();
			await findByText("This is the lastest hoax");
			runTimer();
			const newHoaxCount = await findByText("There is 1 new hoax");
			fireEvent.click(newHoaxCount);
			const firstParam = apiCalls.loadNewHoaxes.mock.calls[0][0];
			expect(firstParam).toBe(10);
			useRealIntervals();
		});
		it("회원상세 페이지에서 New Hoax Count Card 버튼 클릭시, 페이지상 마지막 hoax Id로 커서페이징 api call", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.loadNewHoaxes = jest.fn().mockResolvedValue(mockSuccessGetNewHoaxesList);
			const { findByText } = setup({ username: "user1" });
			await findByText("This is the lastest hoax");
			runTimer();
			const newHoaxCount = await findByText("There is 1 new hoax");

			fireEvent.click(newHoaxCount);
			expect(apiCalls.loadNewHoaxes).toHaveBeenCalledWith(10, "user1");
			useRealIntervals();
		});
		it("loadNewHoaxes api call 성공시 new hoax 보여줌", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.loadNewHoaxes = jest.fn().mockResolvedValue(mockSuccessGetNewHoaxesList);
			const { findByText } = setup({ username: "user1" });
			await findByText("This is the lastest hoax");
			runTimer();
			const newHoaxCount = await findByText("There is 1 new hoax");
			fireEvent.click(newHoaxCount);

			const newHoax = await findByText("This is the newest hoax");

			expect(newHoax).toBeInTheDocument();
			useRealIntervals();
		});
		it("loadNewHoaxes api call 하는 동안, new hoax count 사라짐", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.loadNewHoaxes = jest.fn().mockResolvedValue(mockSuccessGetNewHoaxesList);
			const { queryByText, findByText } = setup({ username: "user1" });
			await findByText("This is the lastest hoax");
			runTimer();
			const newHoaxCount = await findByText("There is 1 new hoax");
			fireEvent.click(newHoaxCount);

			await findByText("This is the newest hoax");

			expect(queryByText("There is 1 new hoax")).not.toBeInTheDocument();
			useRealIntervals();
		});
		it("api call 로딩 중일때, loadOldHoaxes 중복 요청 허용되지 않음", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.loadOldHoaxes = jest
				.fn()
				.mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
			const { findByText } = setup();
			const loadMore = await findByText("Load More");
			fireEvent.click(loadMore);
			fireEvent.click(loadMore);

			expect(apiCalls.loadOldHoaxes).toHaveBeenCalledTimes(1);
		});
		it("api call 로딩 중일때, spinner 보여줌", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.loadOldHoaxes = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve(mockSuccessGetHoaxesLastOfMultiPage);
					}, 300);
				});
			});
			const { queryByText, findByText } = setup();
			const loadMore = await findByText("Load More");
			fireEvent.click(loadMore);
			const spinner = await findByText("Loading...");
			expect(spinner).toBeInTheDocument();
			expect(queryByText("Load More")).not.toBeInTheDocument();
		});
		it("api call 수신 완료 후, spinner 지우고 Load More 표시", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.loadOldHoaxes = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve(mockSuccessGetHoaxesMiddleOfMultiPage);
					}, 300);
				});
			});
			const { queryByText, findByText } = setup();
			const loadMore = await findByText("Load More");
			fireEvent.click(loadMore);
			await findByText("This hoax is in middle page");
			expect(queryByText("Loading...")).not.toBeInTheDocument();
			expect(queryByText("Load More")).toBeInTheDocument();
		});
		it("api call 수신 실패 후, spinner 지우고 Load More 표시", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.loadOldHoaxes = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						reject({ response: { data: {} } });
					}, 300);
				});
			});
			const { queryByText, findByText } = setup();
			const loadMore = await findByText("Load More");
			fireEvent.click(loadMore);
			await findByText("Loading...");
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			expect(queryByText("Loading...")).not.toBeInTheDocument();
			expect(queryByText("Load More")).toBeInTheDocument();
		});
		it("api call 로딩 중일때, loadNewHoaxes 중복 요청 허용되지 않음", async () => {
			// TODO: FIX
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.loadNewHoaxes = jest.fn().mockResolvedValue(mockSuccessGetNewHoaxesList);
			const { queryByText, findByText } = setup({ username: "user1" });
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			runTimer();
			const newHoaxcount = await findByText("There is 1 new hoax");
			fireEvent.click(newHoaxcount);
			fireEvent.click(newHoaxcount);

			expect(apiCalls.loadNewHoaxes).toHaveBeenCalledTimes(1);
			useRealIntervals();
		});
		it("loadNewHoaxes api call 로딩 중일때, spinner 보여줌", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.loadNewHoaxes = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve(mockSuccessGetNewHoaxesList);
					}, 300);
				});
			});
			const { queryByText, findByText } = setup({ username: "user1" });
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			runTimer();
			const newHoaxcount = await findByText("There is 1 new hoax");
			fireEvent.click(newHoaxcount);
			const spinner = await findByText("Loading...");
			expect(spinner).toBeInTheDocument();
			expect(queryByText("There is 1 new hoax")).not.toBeInTheDocument();
			useRealIntervals();
		});
		it("loadNewHoaxes api call 수신 결과 new hoax 1개 있을 경우, spinner 지우고 Load More 표시", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.loadNewHoaxes = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve(mockSuccessGetNewHoaxesList);
					}, 300);
				});
			});
			const { queryByText, findByText } = setup({ username: "user1" });
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			runTimer();
			const newHoaxcount = await findByText("There is 1 new hoax");
			fireEvent.click(newHoaxcount);
			await findByText("This is the newest hoax");
			expect(queryByText("Loading...")).not.toBeInTheDocument();
			expect(queryByText("There is 1 new hoax")).not.toBeInTheDocument();
			useRealIntervals();
		});
		it("loadNewHoaxes api call 수신 실패 후, spinner 지우고 Load More 표시", async () => {
			useFakeIntervals();
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.loadNewHoaxes = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						reject({ response: { data: {} } });
					}, 300);
				});
			});
			const { queryByText, findByText } = setup({ username: "user1" });
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			runTimer();
			const newHoaxcount = await findByText("There is 1 new hoax");
			fireEvent.click(newHoaxcount);
			await findByText("Loading...");
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			expect(queryByText("Loading...")).not.toBeInTheDocument();
			expect(queryByText("There is 1 new hoax")).toBeInTheDocument();
			useRealIntervals();
		});
		it("삭제 버튼 클릭시, modal 표시", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { queryByTestId, container, queryByText } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);

			const modalRootDiv = queryByTestId("modal-root");
			expect(modalRootDiv).toHaveClass("modal fade d-block show");
		});
		it("modal cancel버튼 클릭시, modal 사라짐", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { queryByText, queryByTestId, container } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);
			fireEvent.click(queryByText("Cancel"));

			const modalRootDiv = queryByTestId("modal-root");
			expect(modalRootDiv).not.toHaveClass("d-block show");
		});
		it("modal에 삭제하려는 hoax 내용 표시", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { queryByText, container } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);
			const message = queryByText(`Are you sure to delete "This is the lastest hoax"?`);
			expect(message).toBeInTheDocument();
		});
		it("modal 삭제 버튼 클릭시 deleteHoax api call", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.deleteHoax = jest.fn().mockResolvedValue({});
			const { queryByText, container } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);
			fireEvent.click(queryByText("Delete Hoax"));
			expect(apiCalls.deleteHoax).toHaveBeenCalledWith(10);
		});
		it("deleteHoax api call 성공 후 모달창 닫기", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.deleteHoax = jest.fn().mockResolvedValue({});
			const { queryByText, queryByTestId, container } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);
			fireEvent.click(queryByText("Delete Hoax"));
			await waitForElementToBeRemoved(deleteButton);
			const modalRootDiv = queryByTestId("modal-root");
			expect(modalRootDiv).not.toHaveClass("d-block show");
		});
		it("deleteHoax api call 성공 후 삭제된 hoax 표시X", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.deleteHoax = jest.fn().mockResolvedValue({});
			const { findByText, queryByText, container } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);
			fireEvent.click(queryByText("Delete Hoax"));
			const removedHoax = await findByText("This is the lastest hoax");
			expect(removedHoax).not.toBeInTheDocument();
		});
		it("deleteHoax api call 진행 중 관련 버튼 비활성화", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.deleteHoax = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve({});
					}, 300);
				});
			});
			const { queryByText, container } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);
			const deleteHoax = queryByText("Delete Hoax");
			fireEvent.click(deleteHoax);

			expect(deleteHoax).toBeDisabled();
			expect(queryByText("Cancel")).toBeDisabled();
		});
		it("deleteHoax api call 진행 중 spinner 표시", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.deleteHoax = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve({});
					}, 300);
				});
			});
			const { queryByText, container } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);
			const deleteHoax = queryByText("Delete Hoax");
			fireEvent.click(deleteHoax);
			const spinner = queryByText("Loading...");
			expect(spinner).toBeInTheDocument();
		});
		it("deleteHoax api call 성공 후 spinner 표시X", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			apiCalls.deleteHoax = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve({});
					}, 300);
				});
			});
			const { queryByText, container } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);
			const deleteHoax = queryByText("Delete Hoax");
			fireEvent.click(deleteHoax);
			await waitForElementToBeRemoved(deleteButton);
			const spinner = queryByText("Loading...");
			expect(spinner).not.toBeInTheDocument();
		});
	});
});

console.error = () => {};
