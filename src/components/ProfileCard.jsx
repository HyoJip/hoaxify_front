import React from "react";
import ButtonWithProgress from "./ButtonWithProgress";
import Input from "./Input";
import ProfileImageWithDefault from "./ProfileImageWithDefault";

const ProfileCard = props => {
	const { displayName, username, image } = props.user;
	const showEditButton = props.isEditable && !props.inEditMode;

	return (
		<div className="card">
			<div className="card-header text-center">
				<ProfileImageWithDefault
					className="rounded-circle shadow"
					alt="profile"
					width="200"
					height="200"
					image={image}
					src={props.loadedImage}
				/>
			</div>
			<div className="card-body text-center">
				{!props.inEditMode && <h4>{`${displayName}@${username}`}</h4>}
				{props.inEditMode && (
					<>
						<Input
							value={displayName}
							label={`Change Display Name for ${username}`}
							onChange={props.onChangeDisplayName}
							hasError={props.validationErrors.displayName && true}
							error={props.validationErrors.displayName}
						/>
						<div className="mt-2">
							<Input
								type="file"
								onChange={props.onFileSelect}
								hasError={props.validationErrors.image && true}
								error={props.validationErrors.image}
							/>
						</div>
					</>
				)}
				{showEditButton && (
					<button className="btn btn-outline-success" onClick={props.onClickEdit}>
						<i className="fas fa-user-edit" />
						Edit
					</button>
				)}
				{props.inEditMode && (
					<>
						<ButtonWithProgress
							className="btn btn-primary"
							onClick={props.onClickSave}
							text={
								<span>
									<i className="fas fa-save" />
									Save
								</span>
							}
							pendingAPICall={props.pendingUpdateCall}
							disabled={props.pendingUpdateCall}
						/>
						<button
							className="btn btn-outline-secondary ml-1"
							onClick={props.onClickCancel}
							disabled={props.pendingUpdateCall}
						>
							<span>
								<i className="fas fa-window-close" />
								Cancel
							</span>
						</button>
					</>
				)}
			</div>
		</div>
	);
};

ProfileCard.defaultProps = {
	validationErrors: {},
};

export default ProfileCard;
