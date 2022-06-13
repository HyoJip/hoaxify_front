const initialState = {
	id: 0,
	username: "",
	displayName: "",
	image: "",
	password: "",
	isLoggedIn: false,
};

const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case "LOGOUT_SUCCESS":
			return { ...initialState };
		case "LOGIN_SUCCESS":
			return {
				...action.payload,
				isLoggedIn: true,
			};
		case "UPLOAD_SUCCESS":
			return {
				...state,
				displayName: action.payload.displayName,
				image: action.payload.image,
			};
		default:
			return state;
	}
};

export default authReducer;
