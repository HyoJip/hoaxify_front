import { useState } from "react";

const useInput = (initialValue, validator = null) => {
	const [value, setValue] = useState(initialValue);
	const onChange = event => {
		const curValue = event.target.value;
		let willUpdate = true;

		if (typeof validator === "function") willUpdate = validator(curValue);

		if (willUpdate) setValue(curValue);
	};

	return { value, onChange };
};

export default useInput;
