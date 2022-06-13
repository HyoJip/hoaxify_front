import React from "react";

const Spinner = () => {
	return (
		<div className="d-flex">
			<div className="spinner-border text-black-50 m-auto" role="status">
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	);
};

export default Spinner;
