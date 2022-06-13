import React from "react";
import { fireEvent, render, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import UserPage from "./UserPage";
import * as apiCalls from "../api/apiCalls";
import { Provider } from "react-redux";
import configureStore from "../redux/configureStore";
import axios from "axios";

apiCalls.loadHoaxes = jest.fn().mockResolvedValue({
	data: {
		content: [],
		number: 0,
		size: 3,
	},
});

const mockSuccessGetUser = {
	data: {
		username: "user1",
		displayName: "display1",
		image: "profile1.png",
	},
};

const mockSuccessUpdateUser = {
	data: {
		username: "user1",
		displayName: "display1-update",
		image: "profile-update1.png",
	},
};

const mockFailGetUser = {
	response: {
		data: {
			message: "User not found",
		},
	},
};

const mockFailUpdateUser = {
	response: {
		data: {
			validationErrors: {
				displayName: "It must have minimum 4 and maximum 255 characters",
				image: "Only PNG and JPG files are allowed",
			},
		},
	},
};

const match = {
	params: {
		username: "user1",
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

const mockDelayedResponse = expectedResponse => {
	return jest.fn().mockImplementation(() => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(expectedResponse);
			}, 300);
		});
	});
};

beforeEach(() => {
	localStorage.clear();
	delete axios.defaults.headers.common["Authorization"];
});

let store;
const setup = props => {
	store = configureStore(false);
	return render(
		<Provider store={store}>
			<UserPage {...props} />
			);
		</Provider>
	);
};

describe("UserPage", () => {
	describe("Layout", () => {
		it("홈페이지 div", () => {
			const { queryByTestId } = setup();
			const userPageDiv = queryByTestId("userpage");
			expect(userPageDiv).toBeInTheDocument();
		});
		it("회원 정보 받은 후, display1@username1 렌더링", async () => {
			apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
			const { findByText } = setup({ match });
			const text = await findByText("display1@user1");
			expect(text).toBeInTheDocument();
		});
		it("회원 정보 못 받으면, 에러 메시지", async () => {
			apiCalls.getUser = jest.fn().mockRejectedValue(mockFailGetUser);
			const { findByText } = setup({ match });
			const alert = await findByText("User not found");
			expect(alert).toBeInTheDocument();
		});
		it("로딩 중 표시", () => {
			apiCalls.getUser = mockDelayedResponse(mockSuccessGetUser);
			const { queryAllByText } = setup({ match });
			const spinner = queryAllByText("Loading...");
			expect(spinner.length).not.toBe(0);
		});
		it("회원 정보 받은 후, param username값과 로그인 usernmae이 같으면 수정 버튼 렌더링", async () => {
			setUserOneLoggedInStorage();
			apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
			const { findByText, queryByText } = setup({ match });
			await findByText("display1@user1");
			const editButton = queryByText("Edit");
			expect(editButton).toBeInTheDocument();
		});
	});

	describe("Lifecycle", () => {
		it("user 정보 GET", () => {
			apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
			setup({ match });
			expect(apiCalls.getUser).toHaveBeenCalledTimes(1);
		});
		it("user 정보 GET", () => {
			apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
			setup({ match });
			expect(apiCalls.getUser).toHaveBeenCalledTimes(1);
		});
		it("match 프로퍼티에 user1이 들어왔을 때, user1으로 getUser", () => {
			apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
			setup({ match });
			expect(apiCalls.getUser).toHaveBeenCalledWith("user1");
		});
	});

	describe("ProfileCard Interactions", () => {
		const setupForEdit = async () => {
			setUserOneLoggedInStorage();
			apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
			const rendered = setup({ match });
			const editButton = await rendered.findByText("Edit");
			fireEvent.click(editButton);
			return rendered;
		};

		it("수정 버튼 클릭 시, 수정 폼 표시", async () => {
			const { queryByText } = await setupForEdit();
			expect(queryByText("Save")).toBeInTheDocument();
		});
		it("취소 버튼 클릭 시, 수정 폼 숨김", async () => {
			const { queryByText } = await setupForEdit();
			fireEvent.click(queryByText("Cancel"));
			expect(queryByText("Edit")).toBeInTheDocument();
		});
		it("저장 버튼 클릭 시, api updateUser call", async () => {
			const { queryByRole } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			expect(apiCalls.updateUser).toHaveBeenCalledTimes(1);
		});
		it("회원 ID로 api updateUser call", async () => {
			const { queryByRole } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			const userId = apiCalls.updateUser.mock.calls[0][0];
			expect(userId).toBe(1);
		});
		it("수정된 유저 데이터를 api 송신", async () => {
			const { container, queryByRole } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

			const displayInput = container.querySelector("input");
			fireEvent.change(displayInput, { target: { value: "display1-update" } });
			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			const requestBody = apiCalls.updateUser.mock.calls[0][1];
			expect(requestBody.displayName).toBe("display1-update");
		});
		it("수정이 끝난 뒤 수정 모드 취소", async () => {
			const { findByText, queryByRole } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			const editButtonAfterClickingSave = await findByText("Edit");
			expect(editButtonAfterClickingSave).toBeInTheDocument();
		});
		it("취소버튼 누르면 displayName 초기화", async () => {
			const { queryByText, container } = await setupForEdit();
			const displayInput = container.querySelector("input");
			fireEvent.change(displayInput, { target: { value: "display1-update" } });

			const cancelButton = queryByText("Cancel");
			fireEvent.click(cancelButton);
			const originDisplayText = queryByText("display1@user1");
			expect(originDisplayText).toBeInTheDocument();
		});
		it("취소버튼 누르면 displayName 초기화", async () => {
			const { queryByText, container } = await setupForEdit();
			const displayInput = container.querySelector("input");
			fireEvent.change(displayInput, { target: { value: "display1-update" } });

			const cancelButton = queryByText("Cancel");
			fireEvent.click(cancelButton);
			const originDisplayText = queryByText("display1@user1");
			expect(originDisplayText).toBeInTheDocument();
		});
		it("저장 버튼 클릭 후 api 로딩 중 표시", async () => {
			const { queryByText, queryByRole } = await setupForEdit();
			apiCalls.updateUser = mockDelayedResponse(mockSuccessUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);

			const spinner = queryByText("Loading...");
			expect(spinner).toBeInTheDocument();
		});
		it("저장 버튼 클릭 후 api 로딩 중 저장 버튼 비활성화", async () => {
			const { queryByRole } = await setupForEdit();
			apiCalls.updateUser = mockDelayedResponse(mockSuccessUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			expect(saveButton).toBeDisabled();
		});
		it("저장 버튼 클릭 후 api 로딩 중 취소 버튼 비활성화", async () => {
			const { queryByRole } = await setupForEdit();
			apiCalls.updateUser = mockDelayedResponse(mockSuccessUpdateUser);
			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			const cancelButton = queryByRole("button", { name: "Cancel" });
			expect(cancelButton).toBeDisabled();
		});
		it("저장 후 다시 수정 버튼 눌렀을 때 저장 버튼 활성화", async () => {
			const { findByText, queryByRole } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			const editButton = await findByText("Edit");
			fireEvent.click(editButton);
			const saveButtonForSecondEdit = queryByRole("button", { name: "Save" });

			expect(saveButtonForSecondEdit).not.toBeDisabled();
		});
		it("api 통신 실패 후, save 버튼 활성화", async () => {
			const { queryByRole } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(saveButton).not.toBeDisabled();
			});
		});
		it("수정보드에서 선택된 이미지 미리보기", async () => {
			const { container } = await setupForEdit();
			const inputs = container.querySelectorAll("input");
			const uploadInput = inputs[1];

			const file = new File(["dumy content"], "example.png", {
				type: "image/png",
			});

			fireEvent.change(uploadInput, { target: { files: [file] } });

			await waitFor(() => {
				const image = container.querySelector("img");
				expect(image.src).toContain("data:image/png;base64");
			});
		});
		it("수정모드에서 이미지 미리보고 취소할 경우, 기존 이미지 표시", async () => {
			const { container, queryByText } = await setupForEdit();
			const inputs = container.querySelectorAll("input");
			const uploadInput = inputs[1];
			const file = new File(["dumy content"], "example.png", {
				type: "image/png",
			});

			fireEvent.change(uploadInput, { target: { files: [file] } });
			const cancelButton = queryByText("Cancel");
			fireEvent.click(cancelButton);

			await waitFor(() => {
				const image = container.querySelector("img");
				expect(image.src).toContain("/images/profile/profile1.png");
			});
		});
		it("이미지 선택창에서 이미지 선택하지 않을 경우 에러 페이지 뜨지 않음", async () => {
			const { container } = await setupForEdit();
			const inputs = container.querySelectorAll("input");
			const uploadInput = inputs[1];

			expect(() => {
				fireEvent.change(uploadInput, { target: { files: [] } });
			}).not.toThrow();
		});
		it("수정된 유저 데이터 중 이미지는 data:image/png;base64 제거 후 api 송신", async () => {
			const { queryByRole, container } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);
			const inputs = container.querySelectorAll("input");
			const uploadInput = inputs[1];
			const file = new File(["dumy content"], "example.png", {
				type: "image/png",
			});
			fireEvent.change(uploadInput, { target: { files: [file] } });
			await waitFor(() => {
				const image = container.querySelector("img");
				expect(image.src).toContain("data:image/png;base64");
			});
			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);

			const requestBody = apiCalls.updateUser.mock.calls[0][1];
			expect(requestBody.image).not.toContain("data:image/png;base64");
		});
		it("여러번 이미지 수정, 저장한 후 취소할 경우 제일 최근에 저장된 이미지 표시", async () => {
			const { queryByRole, queryByText, container, findByText } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);
			const inputs = container.querySelectorAll("input");
			const uploadInput = inputs[1];
			const file = new File(["dumy content"], "example.png", {
				type: "image/png",
			});

			fireEvent.change(uploadInput, { target: { files: [file] } });
			await waitFor(() => {
				container.querySelector("img");
			});
			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			const editButtonAfterClickingSave = await findByText("Edit");
			fireEvent.click(editButtonAfterClickingSave);
			const newFile = new File(["another content"], "example1.png", {
				type: "image/png",
			});
			fireEvent.change(uploadInput, { target: { files: [newFile] } });
			const cancelButton = queryByText("Cancel");
			fireEvent.click(cancelButton);
			const image = container.querySelector("img");

			expect(image.src).toContain("/images/profile/profile-update1.png");
		});
		it("api 통신 실패시 displayName에 대한 에러메시지 표시", async () => {
			const { queryByRole, findByText } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);

			const errorMessages = await findByText(
				"It must have minimum 4 and maximum 255 characters"
			);
			expect(errorMessages).toBeInTheDocument();
		});
		it("api 통신 실패시 file input에 대한 에러메시지 표시", async () => {
			const { queryByRole, findByText } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);

			const errorMessages = await findByText("Only PNG and JPG files are allowed");
			expect(errorMessages).toBeInTheDocument();
		});
		it("displayName 값 변경시 에러 제거", async () => {
			const { queryByRole, container, findByText } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			const errorMessages = await findByText(
				"It must have minimum 4 and maximum 255 characters"
			);
			const displayNameInput = container.querySelectorAll("input")[0];
			fireEvent.change(displayNameInput, { target: { value: "new-display-name" } });

			expect(errorMessages).not.toBeInTheDocument();
		});
		it("file 변경시 에러 제거", async () => {
			const { queryByRole, container, findByText } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			const errorMessages = await findByText("Only PNG and JPG files are allowed");
			const fileInput = container.querySelectorAll("input")[1];

			const newFile = new File(["another content"], "example1.png", {
				type: "image/png",
			});
			fireEvent.change(fileInput, { target: { files: [newFile] } });
			await waitForElementToBeRemoved(errorMessages);
			expect(errorMessages).not.toBeInTheDocument();
		});
		it("취소 버튼 클릭시 모든 에러 삭제", async () => {
			const { queryByRole, queryByText, findByText } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			const errorMessage = await findByText(
				"It must have minimum 4 and maximum 255 characters"
			);
			fireEvent.click(queryByText("Cancel"));
			fireEvent.click(queryByText("Edit"));

			expect(errorMessage).not.toBeInTheDocument();
		});
		it("api call 성공 후 redux state 업데이트", async () => {
			const { queryByRole, container } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

			const displayInput = container.querySelector("input");
			fireEvent.change(displayInput, { target: { value: "display1-update" } });
			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			await waitForElementToBeRemoved(saveButton);

			const storedUserData = store.getState();
			expect(storedUserData.displayName).toBe(mockSuccessUpdateUser.data.displayName);
			expect(storedUserData.image).toBe(mockSuccessUpdateUser.data.image);
		});
		it("api call 성공 후 localStorage 업데이트", async () => {
			const { queryByRole, container } = await setupForEdit();
			apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

			const displayInput = container.querySelector("input");
			fireEvent.change(displayInput, { target: { value: "display1-update" } });
			const saveButton = queryByRole("button", { name: "Save" });
			fireEvent.click(saveButton);
			await waitForElementToBeRemoved(saveButton);

			const storedUserData = JSON.parse(localStorage.getItem("hoax-auth"));
			expect(storedUserData.displayName).toBe(mockSuccessUpdateUser.data.displayName);
			expect(storedUserData.image).toBe(mockSuccessUpdateUser.data.image);
		});
	});
});
