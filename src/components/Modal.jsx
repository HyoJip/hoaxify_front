import React from "react";
import ButtonWithProgress from "./ButtonWithProgress";

const Modal = props => {
	let rootClass = "modal fade";
	let rootStyle;
	if (props.visible) {
		rootClass += " d-block show";
		rootStyle = { backgroundColor: "#000000b0" };
	}
	return (
		<div className={rootClass} style={rootStyle} tabIndex="-1" data-testid="modal-root">
			<div className="modal-dialog">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">{props.title}</h5>
						<button
							type="button"
							className="btn-close"
							data-bs-dismiss="modal"
							aria-label="Close"
						></button>
					</div>
					<div className="modal-body">{props.body}</div>
					<div className="modal-footer">
						<button
							className="btn btn-secondary"
							data-bs-dismiss="modal"
							onClick={props.onClickCancel}
							disabled={props.pendingApiCall}
						>
							{props.cancelButton}
						</button>
						<ButtonWithProgress
							pendingAPICall={props.pendingApiCall}
							className="btn btn-danger"
							onClick={props.onClickOk}
							disabled={props.pendingApiCall}
							text={props.okButton}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

Modal.defaultProps = {
	okButton: "Ok",
	cancelButton: "Cancel",
};

export default Modal;
