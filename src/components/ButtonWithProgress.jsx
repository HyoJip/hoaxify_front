import React from "react";

const ButtonWithProgress = props => {
	return (
		<button
			className={props.className || "btn btn-primary"}
			type="submit"
			onClick={props.onClick}
			disabled={props.disabled}
		>
			{props.pendingAPICall && (
				<div className="spinner-border text-light spinner-border-sm mr-sm-1" role="status">
					<span className="sr-only">Loading...</span>
				</div>
			)}
			{props.text}
		</button>
	);
};

export default ButtonWithProgress;
