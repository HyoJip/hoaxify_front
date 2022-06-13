import React, { useCallback } from "react";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import * as apiCalls from "../api/apiCalls";
import HoaxView from "./HoaxView";
import Modal from "./Modal";
import Spinner from "./Spinner";

const HoaxFeed = props => {
	const [page, setPage] = useState({ content: [] });
	const [isLoadingHoaxes, setIsLoadingHoaxes] = useState(false);
	const [isLoadingOldHoaxes, setIsLoadingOldHoaxes] = useState(false);
	const [isLoadingNewHoaxes, setIsLoadingNewHoaxes] = useState(false);
	const [newHoaxCount, setNewHoaxCount] = useState(0);
	const [hoaxToBeDeleted, setHoaxToBeDeleted] = useState(undefined);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const counter = setInterval(() => {
			checkCount();
		}, 3000);
		return () => {
			clearInterval(counter);
		};
	}, [props.username, page.content]);

	useEffect(() => {
		setIsLoadingHoaxes(true);
		apiCalls.loadHoaxes(props.username).then(response => {
			setPage(response.data);
			setIsLoadingHoaxes(false);
		});
	}, [props.username]);

	const checkCount = () => {
		const hoaxes = page.content;
		let topHoaxId = 0;
		if (hoaxes.length > 0) {
			topHoaxId = hoaxes[0].id;
		}
		apiCalls.countNewHoaxes(topHoaxId, props.username).then(response => {
			setNewHoaxCount(response.data.count);
		});
	};

	const onClickLoadMore = () => {
		if (isLoadingOldHoaxes) return;
		const hoaxes = page.content;
		if (hoaxes.length === 0) return;
		setIsLoadingOldHoaxes(true);
		const hoaxAtBottom = hoaxes[hoaxes.length - 1];
		apiCalls
			.loadOldHoaxes(hoaxAtBottom.id, props.username)
			.then(response => {
				setPage(prev => ({
					...response.data,
					content: [...prev.content, ...response.data.content],
				}));
				setIsLoadingOldHoaxes(false);
			})
			.catch(error => {
				setIsLoadingOldHoaxes(false);
			});
	};

	const onClickLoadNew = () => {
		if (isLoadingNewHoaxes) return;
		const hoaxes = page.content;
		let topHoaxId = 0;
		if (hoaxes.length > 0) {
			topHoaxId = hoaxes[0].id;
		}
		setIsLoadingNewHoaxes(true);
		apiCalls
			.loadNewHoaxes(topHoaxId, props.username)
			.then(response => {
				setPage(prev => ({
					...prev,
					content: [...response.data, ...prev.content],
				}));
				setNewHoaxCount(0);
				setIsLoadingNewHoaxes(false);
			})
			.catch(error => {
				setIsLoadingNewHoaxes(false);
			});
	};

	const onClickModalOk = () => {
		setIsDeleting(true);
		apiCalls.deleteHoax(hoaxToBeDeleted.id).then(response => {
			setPage(prev => ({
				...prev,
				content: prev.content.filter(hoax => hoax.id !== hoaxToBeDeleted.id),
			}));
			setHoaxToBeDeleted(undefined);
			setIsDeleting(false);
		});
	};

	if (isLoadingHoaxes) {
		return <Spinner />;
	} else if (page.content.length === 0 && newHoaxCount === 0) {
		return <div className="card card-header text-center">There are no hoaxes</div>;
	} else {
		const newHoaxCountMessage =
			newHoaxCount === 1 ? "There is 1 new hoax" : `There are ${newHoaxCount} new hoaxes`;
		return (
			<div>
				{newHoaxCount > 0 && (
					<div
						className="card card-header text-center"
						onClick={onClickLoadNew}
						style={{ cursor: isLoadingNewHoaxes ? "not-allowed" : "pointer" }}
					>
						{isLoadingNewHoaxes ? <Spinner /> : newHoaxCountMessage}
					</div>
				)}
				{page.content.map(item => (
					<HoaxView
						key={item.id}
						hoax={item}
						onClickDelete={() => setHoaxToBeDeleted(item)}
					/>
				))}
				{page.last === false && (
					<small
						className="card card-header text-center"
						onClick={onClickLoadMore}
						style={{ cursor: isLoadingOldHoaxes ? "not-allowed" : "pointer" }}
					>
						{isLoadingOldHoaxes ? <Spinner /> : "Load More"}
					</small>
				)}
				<Modal
					visible={hoaxToBeDeleted && true}
					onClickCancel={() => setHoaxToBeDeleted()}
					body={hoaxToBeDeleted && `Are you sure to delete "${hoaxToBeDeleted.content}"?`}
					title="Delete"
					okButton="Delete Hoax"
					onClickOk={onClickModalOk}
					pendingApiCall={isDeleting}
				/>
			</div>
		);
	}
};

export default HoaxFeed;
