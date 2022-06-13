import { useState, useEffect, useCallback } from "react";

const useClickTracker = assignActionArea => {
	const [dropDownVisible, setDropDownVisible] = useState(false);

	useEffect(() => {
		document.addEventListener("click", onClickTracker);
		return () => document.removeEventListener("click", onClickTracker);
	});

	const onClickTracker = useCallback(
		event => {
			if (!assignActionArea.current) {
				setDropDownVisible(false);
				return;
			}

			if (dropDownVisible) {
				setDropDownVisible(false);
			} else if (assignActionArea.current.contains(event.target)) {
				setDropDownVisible(true);
			}
		},
		[assignActionArea, dropDownVisible]
	);

	return dropDownVisible;
};

export default useClickTracker;
