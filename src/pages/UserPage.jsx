import React, { useReducer, useEffect } from "react";
import { connect } from "react-redux";
import * as apiCalls from "../api/apiCalls";
import HoaxFeed from "../components/HoaxFeed";
import ProfileCard from "../components/ProfileCard";
import Spinner from "../components/Spinner";

const reducer = (state, action) => {
	switch (action.type) {
		case "LOADING_USER":
			return { ...state, loading: true, error: false };
		case "LOADING_USER_SUCCESS":
			return { ...state, loading: false, user: action.payload };
		case "LOADING_USER_FAILURE":
			return { ...state, loading: false, error: true };
		case "CANCEL":
			return {
				...state,
				validationErrors: {},
				user: { ...state.user, displayName: state.originalDispalyName },
				inEditMode: false,
				image: undefined,
			};
		case "UPDATE_PROGRESS":
			return { ...state, pendingUpdateCall: true };
		case "UPDATE_SUCCESS":
			return {
				...state,
				user: { ...state.user, image: action.payload },
				inEditMode: false,
				pendingUpdateCall: false,
			};
		case "UPDATE_FAILURE":
			return {
				...state,
				validationErrors: action.payload,
				pendingUpdateCall: false,
			};
		case "UPDATE_DISPLAYNAME":
			return {
				...state,
				validationErrors: { ...state.validationErrors, displayName: undefined },
				user: { ...state.user, displayName: action.payload },
			};
		case "SELECT_FILE":
			return {
				...state,
				validationErrors: { ...state.validationErrors, image: undefined },
				image: action.payload,
			};
		case "EDIT_MODE":
			return {
				...state,
				originalDispalyName: state.user.displayName,
				inEditMode: true,
			};
		default:
			return state;
	}
};

const UserPage = props => {
	const [state, dispatch] = useReducer(reducer, {
		user: undefined,
		error: false,
		loading: false,
		inEditMode: false,
		originalDispalyName: undefined,
		pendingUpdateCall: false,
		image: undefined,
		validationErrors: {},
	});

	useEffect(() => {
		const username = props.match.params.username;
		if (!username) {
			return;
		}
		dispatch({ type: "LOADING_USER" });
		apiCalls
			.getUser(username)
			.then(response => dispatch({ type: "LOADING_USER_SUCCESS", payload: response.data }))
			.catch(error => dispatch({ type: "LOADING_USER_FAILURE" }));
	}, [props.match]);

	const onClickSave = () => {
		const userId = props.loggedInUser.id;
		const userUpdate = {
			displayName: state.user.displayName,
			image: state.image && state.image.split(",")[1],
		};

		dispatch({ type: "UPDATE_PROGRESS" });
		apiCalls
			.updateUser(userId, userUpdate)
			.then(response => {
				dispatch({ type: "UPDATE_SUCCESS", payload: response.data.image });

				const action = {
					type: "UPLOAD_SUCCESS",
					payload: response.data,
				};
				props.dispatch(action);
			})
			.catch(error => {
				let errors = {};
				if (error.response.data.validationErrors) {
					errors = error.response.data.validationErrors;
				}
				dispatch({ type: "UPDATE_FAILURE", payload: errors });
			});
	};

	const onFileSelect = event => {
		if (event.target.files.length === 0) return;

		const file = event.target.files[0];
		let reader = new FileReader();
		reader.onloadend = () => {
			dispatch({ type: "SELECT_FILE", payload: reader.result });
		};

		reader.readAsDataURL(file);
	};

	let pageContent;

	if (state.loading) {
		pageContent = <Spinner />;
	} else if (state.error) {
		pageContent = (
			<div className="alert alert-danger text-center">
				<i className="fas fa-exclamation-triangle fa-3x"></i>
				<h5>User not found</h5>
			</div>
		);
	} else {
		const isEditable = props.loggedInUser.username === props.match.params.username;
		pageContent = state.user && (
			<ProfileCard
				user={state.user}
				isEditable={isEditable}
				inEditMode={state.inEditMode}
				onClickEdit={() => dispatch({ type: "EDIT_MODE" })}
				onClickCancel={() => dispatch({ type: "CANCEL" })}
				onClickSave={onClickSave}
				onChangeDisplayName={event =>
					dispatch({ type: "UPDATE_DISPLAYNAME", payload: event.target.value })
				}
				pendingUpdateCall={state.pendingUpdateCall}
				loadedImage={state.image}
				onFileSelect={onFileSelect}
				validationErrors={state.validationErrors}
			/>
		);
	}

	return (
		<div data-testid="userpage">
			<div className="row">
				<div className="col">{pageContent}</div>
				<div className="col">
					<HoaxFeed username={props.match.params.username} />
				</div>
			</div>
		</div>
	);
};

UserPage.defaultProps = {
	match: {
		params: {},
	},
};

const mapStateToProps = state => {
	return {
		loggedInUser: state,
	};
};
export default connect(mapStateToProps)(UserPage);

console.error = () => {};
