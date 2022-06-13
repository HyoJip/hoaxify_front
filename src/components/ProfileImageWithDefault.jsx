import React from "react";
import defaultPicture from "../assets/profile.png";

const ProfileImageWithDefault = props => {
	let imageSource = defaultPicture;
	if (props.image) {
		imageSource = `/images/profile/${props.image}`;
	}

	return (
		<img
			className="rounded-circle"
			{...props}
			src={props.src || imageSource}
			alt=""
			onError={event => {
				event.target.src = defaultPicture;
			}}
		/>
	);
};

export default ProfileImageWithDefault;
