import React, { useState } from "react";
import { connect } from "react-redux";
import ButtonWithProgress from "../components/ButtonWithProgress";
import Input from "../components/Input";
import useInput from "../hooks/useInput";
import * as authActions from "../redux/authActions";

export const LoginPage = props => {
	const { value: username, onChange: onChangeUsername } = useInput("");
	const { value: password, onChange: onChangePassword } = useInput("");
	const [apiError, setApiError] = useState(undefined);
	const [pendingAPICall, setPendingAPICall] = useState(false);

	const onClickLogin = () => {
		const body = {
			username,
			password,
		};
		setPendingAPICall(true);
		props.actions
			.postLogin(body)
			.then(response => {
				setPendingAPICall(false);
				props.history.push("/");
			})
			.catch(error => {
				if (error.response) {
					setApiError(error.response.data.message);
					setPendingAPICall(false);
				}
			});
	};

	let disableSubmit = true;
	if (username !== "" && password !== "") {
		disableSubmit = false;
	}

	return (
		<div className="container">
			<h1 className="text-center">Login</h1>
			<div className="col-12 mb-3">
				<Input
					label="Username"
					placeholder="Your username"
					value={username}
					onChange={event => {
						onChangeUsername(event);
						setApiError(undefined);
					}}
				/>
			</div>
			<div className="col-12 mb-3">
				<Input
					type="password"
					label="Password"
					placeholder="Your password"
					value={password}
					onChange={event => {
						onChangePassword(event);
						setApiError(undefined);
					}}
				/>
			</div>
			{apiError && (
				<div className="col-12 mb-3">
					<div className="alert alert-danger">{apiError}</div>
				</div>
			)}
			<div className="text-center">
				<ButtonWithProgress
					onClick={onClickLogin}
					disabled={disableSubmit || pendingAPICall}
					pendingAPICall={pendingAPICall}
					text="Login"
				/>
			</div>
		</div>
	);
};

LoginPage.defaultProps = {
	actions: {
		postLogin: () => new Promise((resolve, reject) => resolve({})),
	},
	dispatch: () => {},
};

const mapDispatchToProps = dispatch => {
	return {
		actions: {
			postLogin: body => dispatch(authActions.loginHandler(body)),
		},
	};
};

export default connect(null, mapDispatchToProps)(LoginPage);
