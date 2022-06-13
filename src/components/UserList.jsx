import React, { useCallback } from "react";
import { useState } from "react";
import { useEffect } from "react";
import * as apiCalls from "../api/apiCalls";
import UserListItem from "./UserListItem";

const UserList = () => {
	const initialPage = {
		content: [],
		number: 0,
		size: 3,
	};
	const [page, setPage] = useState(initialPage);
	const [loadError, setLoadError] = useState("");

	const loadData = useCallback(
		(requestedPage = 0) => {
			apiCalls
				.listUsers({ page: requestedPage, size: page.size })
				.then(response => {
					setPage(response.data);
					setLoadError(undefined);
				})
				.catch(error => {
					setLoadError("Load Error");
				});
		},
		[page.size]
	);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const onClickNext = () => {
		loadData(page.number + 1);
	};

	const onClickPrev = () => {
		loadData(page.number - 1);
	};

	return (
		<div className="card">
			<h3 className="card-title">Users</h3>
			<div className="list-group list-group-flush" data-testid="usergroup">
				{page.content.map(user => {
					return <UserListItem key={user.username} user={user} />;
				})}
			</div>
			<div>
				{!page.first && (
					<span
						className="badge badge-light float-left"
						style={{ cursor: "pointer" }}
						onClick={onClickPrev}
					>
						{"< prev"}
					</span>
				)}
				{!page.last && (
					<span
						className="badge badge-light float-right"
						style={{ cursor: "pointer" }}
						onClick={onClickNext}
					>
						{"next >"}
					</span>
				)}
			</div>
			{loadError && <span className="text-center text-danger">{loadError}</span>}
		</div>
	);
};

export default UserList;

console.error = () => {};
