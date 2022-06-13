import React from "react";
import { connect } from "react-redux";
import HoaxFeed from "../components/HoaxFeed";
import HoaxSubmit from "../components/HoaxSubmit";
import UserList from "../components/UserList";

const HomePage = props => {
	return (
		<div data-testid="homepage">
			<div className="row">
				<div className="col-8">
					{props.loggedInState.isLoggedIn && <HoaxSubmit />}
					<HoaxFeed />
				</div>
				<div className="col-4">
					<UserList />
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = state => {
	return {
		loggedInState: state,
	};
};

export default connect(mapStateToProps)(HomePage);
