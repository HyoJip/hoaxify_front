import React from "react";
import { fireEvent, render } from "@testing-library/react";
import Modal from "./Modal";

describe("Modal", () => {
	describe("Layout", () => {
		it("visible === true면, 보임", () => {
			const { queryByTestId } = render(<Modal visible={true} />);
			const modalRootDiv = queryByTestId("modal-root");
			expect(modalRootDiv).toHaveClass("modal fade d-block show");
			expect(modalRootDiv).toHaveStyle("background-color: #000000b0");
		});
		it("prop으로 제공된 타이틀 표시", () => {
			const { queryByText } = render(<Modal title="Test Title" />);
			expect(queryByText("Test Title")).toBeInTheDocument();
		});
		it("props으로 제공된 Ok 버튼 표시", () => {
			const { queryByText } = render(<Modal okButton="Ok" />);
			expect(queryByText("Ok")).toBeInTheDocument();
		});
		it("props으로 제공된 Cancel 버튼 표시", () => {
			const { queryByText } = render(<Modal cancelButton="Cancel" />);
			expect(queryByText("Cancel")).toBeInTheDocument();
		});
		it("props으로 제공되지 않을 경우 기본적으로 Ok Cancel", () => {
			const { queryByText } = render(<Modal />);
			expect(queryByText("Ok")).toBeInTheDocument();
			expect(queryByText("Cancel")).toBeInTheDocument();
		});
		it("ok버튼 클릭시 props.onClickOk 실행", () => {
			const mockFn = jest.fn();
			const { queryByText } = render(<Modal onClickOk={mockFn} />);
			fireEvent.click(queryByText("Ok"));
			expect(mockFn).toHaveBeenCalled();
		});
		it("ok버튼 클릭시 props.onClickCancel 실행", () => {
			const mockFn = jest.fn();
			const { queryByText } = render(<Modal onClickCancel={mockFn} />);
			fireEvent.click(queryByText("Cancel"));
			expect(mockFn).toHaveBeenCalled();
		});
	});
});
