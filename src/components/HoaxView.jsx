import React, { useRef } from "react";
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import useClickTracker from "../hooks/useClickTracker";

const HoaxView = props => {
	const actionArea = useRef();
	const dropDownVisible = useClickTracker(actionArea);

	const { user } = props.hoax;
	const relativeDate = format(props.hoax.date);
	const attachmentImageVisible =
		props.hoax.attachment && props.hoax.attachment.fileType.startsWith("image");

	const ownedByLoggedInUser = user.id === props.loggedInUser.id;

	let dropDownMenuClass = "p-0 shadow dropdown-menu";
	if (dropDownVisible) {
		dropDownMenuClass += " show";
	}
	return (
		<div className="card p-1">
			<div className="d-flex">
				<ProfileImageWithDefault
					className="rounded-circle"
					width="32"
					height="32"
					image={user.image}
				/>
				<div className="flex-fill m-auto pl-2">
					<Link to={`/${user.username}`} className="list-group-item-action">
						<h6 className="d-inline">
							{user.displayName}@{user.username}
						</h6>
					</Link>
					<span className="text-black-50"> - </span>
					<span className="text-black-50">{relativeDate}</span>
				</div>
				{ownedByLoggedInUser && (
					<div className="dropdown">
						<span
							className="btn btn-sm btn-light dropdown-toggle"
							data-testid="hoax-actions"
							ref={actionArea}
						/>
						<div className={dropDownMenuClass} data-testid="hoax-action-dropdown">
							<button
								className="btn btn-outline-danger btn-sm btn-block text-left"
								onClick={props.onClickDelete}
							>
								<i className="far fa-trash-alt"></i> DELETE
							</button>
						</div>
					</div>
				)}
			</div>
			<div className="pl-5">{props.hoax.content}</div>
			{attachmentImageVisible && (
				<div className="pl-5">
					<img
						src={`/images/attachment/${props.hoax.attachment.name}`}
						alt="attachment"
						className="img=fluid"
					/>
				</div>
			)}
		</div>
	);
};

const mapStateToProps = state => {
	return {
		loggedInUser: state,
	};
};

export default connect(mapStateToProps)(HoaxView);
