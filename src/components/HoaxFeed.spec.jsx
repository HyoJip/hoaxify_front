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
		it("???????????? ??? api call", () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
			setup();
			expect(apiCalls.loadHoaxes).toHaveBeenCalled();
		});
		it("username??? ??????????????? api call", () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
			setup({ username: "user1" });
			expect(apiCalls.loadHoaxes).toHaveBeenCalledWith("user1");
		});
		it("username ?????? api call", () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
			setup();
			const param = apiCalls.loadHoaxes.mock.calls[0][0];
			expect(param).toBeUndefined();
		});
		it("?????? Hoax id loadNewHoaxCount APIcall", async () => {
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
		it("?????? Hoax id username loadNewHoaxCount APIcall", async () => {
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
		it("count api call ????????? count ??????", async () => {
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
		it("??????????????? count api call", async () => {
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
		it("unmounted ??? count call X", async () => {
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
		it("userpage hoax??? ????????? ?????? ??????????????? ??????????????? count api call", async () => {
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
		it("hoax??? ?????? ??? ????????? ??????", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
			const { findByText } = setup();
			expect(await findByText("There are no hoaxes")).toBeInTheDocument();
		});
		it("hoax??? ?????? ??? ?????? ????????? ?????? X", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesSinglePage);
			const { queryByText } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			expect(queryByText("There are no hoaxes")).not.toBeInTheDocument();
		});
		it("hoax ?????? ???, spinner ??????", async () => {
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
		it("hoax ?????? ??????", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesSinglePage);
			const { queryByText } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			expect(queryByText("This is the lastes hoax")).toBeInTheDocument();
		});
		it("?????? ????????? ?????? ??????, Load More ??????", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			const { findByText } = setup();
			const loadMore = await findByText("Load More");
			expect(loadMore).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("LoadMore ?????? ?????????, ???????????? ????????? hoax Id??? ??????????????? api call", async () => {
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
		it("???????????? ??????????????? LoadMore ?????? ?????????, ???????????? ????????? hoax Id??? ??????????????? api call", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.loadOldHoaxes = jest
				.fn()
				.mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
			const { findByText } = setup({ username: "user1" });
			const loadMore = await findByText("Load More");

			fireEvent.click(loadMore);
			expect(apiCalls.loadOldHoaxes).toHaveBeenCalledWith(9, "user1");
		});
		it("LoadMore ?????? ?????????, ?????? ????????? ??????", async () => {
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
		it("????????? ???????????? ??????, LoadMore ?????? X", async () => {
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

		// ????????? ?????? ??????
		it("New Hoax Count Card ?????? ?????????, loadNewHoaxes api call", async () => {
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
		it("???????????? ??????????????? New Hoax Count Card ?????? ?????????, ???????????? ????????? hoax Id??? ??????????????? api call", async () => {
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
		it("loadNewHoaxes api call ????????? new hoax ?????????", async () => {
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
		it("loadNewHoaxes api call ?????? ??????, new hoax count ?????????", async () => {
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
		it("api call ?????? ?????????, loadOldHoaxes ?????? ?????? ???????????? ??????", async () => {
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
		it("api call ?????? ?????????, spinner ?????????", async () => {
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
		it("api call ?????? ?????? ???, spinner ????????? Load More ??????", async () => {
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
		it("api call ?????? ?????? ???, spinner ????????? Load More ??????", async () => {
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
		it("api call ?????? ?????????, loadNewHoaxes ?????? ?????? ???????????? ??????", async () => {
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
		it("loadNewHoaxes api call ?????? ?????????, spinner ?????????", async () => {
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
		it("loadNewHoaxes api call ?????? ?????? new hoax 1??? ?????? ??????, spinner ????????? Load More ??????", async () => {
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
		it("loadNewHoaxes api call ?????? ?????? ???, spinner ????????? Load More ??????", async () => {
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
		it("?????? ?????? ?????????, modal ??????", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { queryByTestId, container, queryByText } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);

			const modalRootDiv = queryByTestId("modal-root");
			expect(modalRootDiv).toHaveClass("modal fade d-block show");
		});
		it("modal cancel?????? ?????????, modal ?????????", async () => {
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
		it("modal??? ??????????????? hoax ?????? ??????", async () => {
			apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
			apiCalls.countNewHoaxes = jest.fn().mockResolvedValue({ data: { count: 1 } });
			const { queryByText, container } = setup();
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			const deleteButton = container.querySelectorAll("button")[0];
			fireEvent.click(deleteButton);
			const message = queryByText(`Are you sure to delete "This is the lastest hoax"?`);
			expect(message).toBeInTheDocument();
		});
		it("modal ?????? ?????? ????????? deleteHoax api call", async () => {
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
		it("deleteHoax api call ?????? ??? ????????? ??????", async () => {
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
		it("deleteHoax api call ?????? ??? ????????? hoax ??????X", async () => {
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
		it("deleteHoax api call ?????? ??? ?????? ?????? ????????????", async () => {
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
		it("deleteHoax api call ?????? ??? spinner ??????", async () => {
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
		it("deleteHoax api call ?????? ??? spinner ??????X", async () => {
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
