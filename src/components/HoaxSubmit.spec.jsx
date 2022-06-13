import React from "react";
import { fireEvent, render, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import HoaxSubmit from "./HoaxSubmit";
import { Provider } from "react-redux";
import { createStore } from "redux";
import authReducer from "../redux/authReducer";
import * as apiCalls from "../api/apiCalls";

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
			<HoaxSubmit />
		</Provider>
	);
};

describe("HoaxSubmit", () => {
	describe("Layout", () => {
		it("textarea", () => {
			const { container } = setup();
			const textarea = container.querySelector("textarea");
			expect(textarea).toBeInTheDocument();
		});
		it("image", () => {
			const { container } = setup();
			const image = container.querySelector("img");
			expect(image).toBeInTheDocument();
		});
		it("textarea 한 줄", () => {
			const { container } = setup();
			const textarea = container.querySelector("textarea");
			expect(textarea.rows).toBe(1);
		});
		it("회원 프로필 사진", () => {
			const { container } = setup();
			const profileImage = container.querySelector("img");
			expect(profileImage.src).toContain("/images/profile/" + defaultState.image);
		});
	});

	describe("Interactions", () => {
		let textArea;
		const setupTextAreaFocused = () => {
			const rendered = setup();
			textArea = rendered.container.querySelector("textarea");
			fireEvent.focus(textArea);
			return rendered;
		};
		it("textarea로 포커스 될 때, 3 줄로 변함", () => {
			setupTextAreaFocused();
			expect(textArea.rows).toBe(3);
		});
		it("textarea로 포커스 될 때, hoaxify 버튼 표시", () => {
			const { queryByText } = setupTextAreaFocused();
			const button = queryByText("Hoaxify");
			expect(button).toBeInTheDocument();
		});
		it("textarea로 포커스 될 때, cancel 버튼 표시", () => {
			const { queryByText } = setupTextAreaFocused();
			const button = queryByText("Cancel");
			expect(button).toBeInTheDocument();
		});
		it("textarea 포커스 안 될 때, hoaxify 버튼 사라짐", () => {
			const { queryByText } = setup();
			const hoaxifyButton = queryByText("Hoaxify");
			expect(hoaxifyButton).not.toBeInTheDocument();
		});
		it("textarea 포커스 안 될 때, cancel 버튼 사라짐", () => {
			const { queryByText } = setup();
			const cancelButton = queryByText("Cancel");
			expect(cancelButton).not.toBeInTheDocument();
		});
		it("cancel 버튼 클릭시 unfocus 상태로 돌아옴", () => {
			const { queryByText } = setupTextAreaFocused();
			const button = queryByText("Cancel");
			fireEvent.click(button);
			expect(queryByText("Cancel")).not.toBeInTheDocument();
		});
		it("hoaxify 버튼 클릭시, textarea 내용 api call", () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockResolvedValue({});
			fireEvent.click(button);
			expect(apiCalls.postHoax).toHaveBeenCalledWith({
				content: "Test hoax content",
			});
		});
		it("api 콜 성공 이후 포커스 상태 취소", async () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockResolvedValue({});
			fireEvent.click(button);

			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			expect(queryByText("Cancel")).not.toBeInTheDocument();
		});
		it("api 콜 성공 이후 textarea 내용 리셋", async () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockResolvedValue({});
			fireEvent.click(button);

			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			expect(queryByText("Test hoax content")).not.toBeInTheDocument();
		});
		it("취소 버튼 클릭시, textarea 내용 리셋", () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Cancel");

			fireEvent.click(button);
			expect(queryByText("Test hoax content")).not.toBeInTheDocument();
		});
		it("api 콜 진행 중에 hoaxify 버튼 비활성화", async () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			const mockDelayedFunction = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => resolve({}), 300);
				});
			});
			apiCalls.postHoax = mockDelayedFunction;

			fireEvent.click(button);
			fireEvent.click(button);

			expect(apiCalls.postHoax).toHaveBeenCalledTimes(1);
		});
		it("api 콜 진행 중에 취소 버튼 비활성화", async () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const mockDelayedFunction = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => resolve({}), 300);
				});
			});
			apiCalls.postHoax = mockDelayedFunction;

			const button = queryByText("Hoaxify");
			fireEvent.click(button);

			expect(queryByText("Cancel")).toBeDisabled();
		});
		it("api 콜 진행 중에 로딩 활성화", async () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			const mockDelayedFunction = jest.fn().mockImplementation(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => resolve({}), 300);
				});
			});
			apiCalls.postHoax = mockDelayedFunction;

			fireEvent.click(button);

			expect(queryByText("Loading...")).toBeInTheDocument();
		});
		it("api 콜 실패 후 hoaxify 버튼 활성화", async () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockRejectedValueOnce({
				response: {
					data: {
						validationErrors: {
							content: "It must have minimun 10 and maximum 5000 characters",
						},
					},
				},
			});

			fireEvent.click(button);
			await waitFor(() => {
				expect(queryByText("Hoaxify")).not.toBeDisabled();
			});
		});
		it("api 콜 실패 후 취소 버튼 활성화", async () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockRejectedValueOnce({
				response: {
					data: {
						validationErrors: {
							content: "It must have minimun 10 and maximum 5000 characters",
						},
					},
				},
			});

			fireEvent.click(button);
			await waitFor(() => {
				expect(queryByText("Cancel")).not.toBeDisabled();
			});
		});
		it("api 콜 성공 이후 textarea에 다시 포커스시 button 활성화", async () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockResolvedValue({});
			fireEvent.click(button);

			await waitFor(() => {
				fireEvent.focus(textArea);
				expect(queryByText("Hoaxify")).not.toBeDisabled();
			});
		});
		it("api 콜 실패 후 실패 메시지 표시", async () => {
			const { queryByText, findByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockRejectedValueOnce({
				response: {
					data: {
						validationErrors: {
							content: "It must have minimun 10 and maximum 5000 characters",
						},
					},
				},
			});

			fireEvent.click(button);
			const message = await findByText("It must have minimun 10 and maximum 5000 characters");

			expect(message).toBeInTheDocument();
		});
		it("실패 메시지 취소버튼 클릭 후 삭제", async () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockRejectedValueOnce({
				response: {
					data: {
						validationErrors: {
							content: "It must have minimun 10 and maximum 5000 characters",
						},
					},
				},
			});

			fireEvent.click(button);
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			fireEvent.click(queryByText("Cancel"));

			expect(
				queryByText("It must have minimun 10 and maximum 5000 characters")
			).not.toBeInTheDocument();
		});
		it("실패 메시지 textarea 값 변경시 삭제", async () => {
			const { queryByText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockRejectedValueOnce({
				response: {
					data: {
						validationErrors: "It must have minimun 10 and maximum 5000 characters",
					},
				},
			});

			fireEvent.click(button);
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			expect(
				queryByText("It must have minimun 10 and maximum 5000 characters")
			).not.toBeInTheDocument();
		});
		it("입력상태일 경우, 파일 업로드 버튼 표시", () => {
			const { container } = setupTextAreaFocused();

			const uploadInput = container.querySelector("input");
			expect(uploadInput.type).toBe("file");
		});
		it("파일 선택시, 이미지 미리보기", async () => {
			const { container, findByAltText } = setupTextAreaFocused();

			const uploadInput = container.querySelector("input");
			expect(uploadInput.type).toBe("file");

			const file = new File(["dumy content"], "example.png", {
				type: "image/png",
			});
			fireEvent.change(uploadInput, { target: { files: [file] } });
			await findByAltText("upload");

			const images = container.querySelectorAll("img");
			const attachmentImage = images[1];
			expect(attachmentImage.src).toContain("data:image/png;base64");
		});
		it("취소 버튼 클릭시, 이미지 사라짐", async () => {
			const { container, queryByText, findByAltText } = setupTextAreaFocused();

			const uploadInput = container.querySelector("input");
			expect(uploadInput.type).toBe("file");

			const file = new File(["dumy content"], "example.png", {
				type: "image/png",
			});
			fireEvent.change(uploadInput, { target: { files: [file] } });
			await findByAltText("upload");

			fireEvent.click(queryByText("Cancel"));
			fireEvent.focus(textArea);
			const images = container.querySelectorAll("img");
			expect(images.length).toBe(1);
		});
		it("파일 선택시 postHoaxFile api 호출됨", async () => {
			apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
				data: {
					id: 1,
					name: "random-name.png",
				},
			});

			const { container, findByAltText } = setupTextAreaFocused();

			const uploadInput = container.querySelector("input");
			expect(uploadInput.type).toBe("file");

			const file = new File(["dummy content"], "example.png", {
				type: "image/png",
			});
			fireEvent.change(uploadInput, { target: { files: [file] } });
			await findByAltText("upload");
			expect(apiCalls.postHoaxFile).toHaveBeenCalledTimes(1);
		});
		it("파일 선택시 postHoaxFile api로 파일을 보냄", async () => {
			apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
				data: {
					id: 1,
					name: "random-name.png",
				},
			});

			const { container, findByAltText } = setupTextAreaFocused();

			const uploadInput = container.querySelector("input");
			expect(uploadInput.type).toBe("file");

			const file = new File(["dummy content"], "example.png", {
				type: "image/png",
			});
			fireEvent.change(uploadInput, { target: { files: [file] } });
			await findByAltText("upload");

			const body = apiCalls.postHoaxFile.mock.calls[0][0];
			const readFile = () => {
				return new Promise((resolve, reject) => {
					const reader = new FileReader();

					reader.onloadend = () => {
						resolve(reader.result);
					};

					reader.readAsText(body.get("file"));
				});
			};
			const result = await readFile();
			expect(result).toBe("dummy content");
		});
		it("hoaxify 버튼 클릭시 파일과 함께 hoax post api call", async () => {
			apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
				data: {
					id: 1,
					name: "random-name.png",
				},
			});

			const { container, queryByText, findByAltText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const uploadInput = container.querySelector("input");
			expect(uploadInput.type).toBe("file");

			const file = new File(["dummy content"], "example.png", {
				type: "image/png",
			});
			fireEvent.change(uploadInput, { target: { files: [file] } });
			await findByAltText("upload");

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockResolvedValue({});
			fireEvent.click(button);

			expect(apiCalls.postHoax).toHaveBeenCalledWith({
				content: "Test hoax content",
				attachment: {
					id: 1,
					name: "random-name.png",
				},
			});
		});
		it("hoaxify 업로드 성공시 이미지 미리보기 리셋", async () => {
			apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
				data: {
					id: 1,
					name: "random-name.png",
				},
			});

			const { container, queryByText, findByAltText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const uploadInput = container.querySelector("input");
			expect(uploadInput.type).toBe("file");

			const file = new File(["dummy content"], "example.png", {
				type: "image/png",
			});
			fireEvent.change(uploadInput, { target: { files: [file] } });
			await findByAltText("upload");

			const button = queryByText("Hoaxify");

			apiCalls.postHoax = jest.fn().mockResolvedValue({});
			fireEvent.click(button);
			await waitForElementToBeRemoved(() => queryByText("Loading..."));
			fireEvent.focus(textArea);
			const images = container.querySelectorAll("img");
			expect(images.length).toBe(1);
		});
		it("파일 선택 취소 후, hoaxify 버튼 클릭시 attachment == null", async () => {
			apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
				data: {
					id: 1,
					name: "random-name.png",
				},
			});

			const { container, queryByText, findByAltText } = setupTextAreaFocused();
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const uploadInput = container.querySelector("input");
			expect(uploadInput.type).toBe("file");

			const file = new File(["dummy content"], "example.png", {
				type: "image/png",
			});
			fireEvent.change(uploadInput, { target: { files: [file] } });
			await findByAltText("upload");

			fireEvent.click(queryByText("Cancel"));
			fireEvent.focus(textArea);
			fireEvent.change(textArea, { target: { value: "Test hoax content" } });

			const button = queryByText("Hoaxify");

			fireEvent.click(button);
			expect(apiCalls.postHoax).toHaveBeenCalledWith({
				content: "Test hoax content",
			});
		});
	});
});
