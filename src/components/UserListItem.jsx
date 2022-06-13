import React from "react";
import { Link } from "react-router-dom";
import ProfileImageWithDefault from "./ProfileImageWithDefault";

const UserListItem = props => {
	return (
		<Link to={`/${props.user.username}`}>
			<div className="list-group-item list-group-item-action">
				<ProfileImageWithDefault
					alt="profile"
					width="32"
					height="32"
					image={props.user.image}
				/>
				<span className="pl-2">{`${props.user.displayName}@${props.user.username}`}</span>
			</div>
		</Link>
	);
};

export default UserListItem;
