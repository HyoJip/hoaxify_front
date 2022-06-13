import React, { useState } from "react";
import { connect } from "react-redux";
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import * as apiCalls from "../api/apiCalls";
import ButtonWithProgress from "./ButtonWithProgress";
import Input from "./Input";
import { useEffect } from "react";

const HoaxSubmit = props => {
	const [focused, setFocused] = useState(false);
	const [content, setContent] = useState(undefined);
	const [pendingApiCall, setPendingApiCall] = useState(false);
	const [validationError, setValidationError] = useState({});
	const [image, setImage] = useState(undefined);
	const [file, setFile] = useState(undefined);
	const [attachment, setAttachment] = useState(undefined);

	useEffect(() => {
		if (file) {
			uploadFile();
		}
	}, [file]);

	const resetState = () => {
		setPendingApiCall(false);
		setFocused(false);
		setContent("");
		setValidationError({});
		setFile(undefined);
		setImage(undefined);
		setAttachment(undefined);
	};

	const uploadFile = () => {
		const body = new FormData();
		body.append("file", file);
		apiCalls.postHoaxFile(body).then(response => {
			setAttachment(response.data);
		});
	};

	const onFocus = () => {
		setFocused(true);
	};

	const onChangeContent = event => {
		setContent(event.target.value);
		setValidationError({});
	};

	const onClickHoaxifyBtn = () => {
		const body = { content, attachment };
		setPendingApiCall(true);
		apiCalls
			.postHoax(body)
			.then(response => {
				resetState();
			})
			.catch(error => {
				if (error.response.data && error.response.data.validationErrors) {
					setValidationError(error.response.data.validationErrors);
				}
				setPendingApiCall(false);
				setFile(undefined);
				setImage(undefined);
			});
	};

	const onFileSelect = event => {
		if (event.target.files.length === 0) return;

		const file = event.target.files[0];
		let reader = new FileReader();
		reader.onloadend = () => {
			setImage(reader.result);
			setFile(file);
		};

		reader.readAsDataURL(file);
	};

	let textareaClassName = "form-control w-100";
	if (validationError.content) {
		textareaClassName += " is-invalid";
	}

	return (
		<div className="card d-flex flex-row w-100">
			<ProfileImageWithDefault
				className="rounded-circle m-1"
				width="32"
				height="32"
				image={props.loggedInState.image}
			/>
			<div className="flex-fill">
				<textarea
					className={textareaClassName}
					onFocus={onFocus}
					rows={focused ? 3 : 1}
					onChange={onChangeContent}
					value={content}
				/>
				{validationError.content && (
					<span className="invalid-feedback">{validationError.content}</span>
				)}
				{focused && (
					<div>
						<div className="pt-1">
							<Input type="file" onChange={onFileSelect} />
							{image && (
								<img
									src={image}
									alt="upload"
									className="mt-1 img-thumbnail"
									width="128"
									height="64"
								/>
							)}
						</div>
						<div className="text-right mt-1">
							<ButtonWithProgress
								className="btn btn-success"
								onClick={onClickHoaxifyBtn}
								disabled={pendingApiCall}
								text="Hoaxify"
								pendingAPICall={pendingApiCall}
							/>

							<button
								className="btn btn-light ml-1"
								onClick={resetState}
								disabled={pendingApiCall}
							>
								<i className="fas fa-times"></i>
								Cancel
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const mapStateToProps = state => {
	return {
		loggedInState: state,
	};
};

console.error = () => {};

export default connect(mapStateToProps)(HoaxSubmit);
