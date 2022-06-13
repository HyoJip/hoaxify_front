import React, { useState } from "react";
import Input from "../components/Input";
import ButtonWithProgress from "../components/ButtonWithProgress";
import { connect } from "react-redux";
import * as authActions from "../redux/authActions";

export const UserSignupPage = props => {
	const [form, setForm] = useState({
		displayName: "",
		username: "",
		password: "",
		passwordRepeat: "",
	});
	const [pendingAPICall, setPendingAPICall] = useState(false);
	const [errors, setErrors] = useState({});

	const onChangeForm = event => {
		const { value, name } = event.target;
		setForm(prev => ({
			...prev,
			[name]: value,
		}));
		delete errors[name];
	};

	const onClickSignup = () => {
		const user = {
			displayName: form.displayName,
			username: form.username,
			password: form.password,
		};
		setPendingAPICall(true);
		props.actions
			.postSignup(user)
			.then(response => {
				setPendingAPICall(false);
				props.history.push("/");
			})
			.catch(apiError => {
				if (apiError.response.data && apiError.response.data.validationErrors) {
					setErrors(apiError.response.data.validationErrors);
				}
				setPendingAPICall(false);
			});
	};

	let passwordRepeatError;
	const { password, passwordRepeat } = form;
	if (password || passwordRepeat) {
		passwordRepeatError = password === passwordRepeat ? "" : "Does not match to password";
	}

	return (
		<div className="container">
			<h1 className="text-center">Sign Up</h1>
			<div className="col-12 mb-3">
				<Input
					name="displayName"
					label="Display Name"
					placeholder="Your Display Name"
					value={form.displayName}
					onChange={onChangeForm}
					hasError={errors.displayName}
					error={errors.displayName}
				></Input>
			</div>
			<div className="col-12 mb-3">
				<Input
					name="username"
					label="Username"
					placeholder="Your Username"
					value={form.username}
					onChange={onChangeForm}
					hasError={errors.username}
					error={errors.username}
				></Input>
			</div>
			<div className="col-12 mb-3">
				<Input
					name="password"
					label="Password"
					type="password"
					placeholder="Your Password"
					value={form.password}
					onChange={onChangeForm}
					hasError={errors.password}
					error={errors.password}
				></Input>
			</div>
			<div className="col-12 mb-3">
				<Input
					name="passwordRepeat"
					label="Password Repeat"
					type="password"
					placeholder="Repeat Your Password"
					value={form.passwordRepeat}
					onChange={onChangeForm}
					hasError={passwordRepeatError}
					error={passwordRepeatError}
				></Input>
			</div>
			<div className="text-center">
				<ButtonWithProgress
					type="submit"
					onClick={onClickSignup}
					disabled={passwordRepeatError || pendingAPICall}
					pendingAPICall={pendingAPICall}
					text="Sign up"
				/>
			</div>
		</div>
	);
};

UserSignupPage.defaultProps = {
	actions: {
		postSignup: () => new Promise((resolve, reject) => resolve({})),
	},
	history: {
		push: () => {},
	},
};

const mapDispatcjToProps = dispath => {
	return {
		actions: {
			postSignup: user => dispath(authActions.signupHandler(user)),
		},
	};
};

export default connect(null, mapDispatcjToProps)(UserSignupPage);
