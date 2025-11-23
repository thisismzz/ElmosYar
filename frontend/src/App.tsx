import React, { useEffect } from 'react';
import { useState, } from 'react';
import Comments from './components/Comments';
import { Comment } from './types/comments';
import './App.css';
import { getCommentsForPost } from './services/commentService';
import { stringify } from 'querystring';

async function loadComments() {
	const comments = await getCommentsForPost(1);
}

function App() {
	// 1 for now
	const postId: number = 1;

	const [commentsList, setCommentsList] = useState<Comment[]>([]);

	useEffect(() => {
		async function loadComments() {
			const result = await getCommentsForPost(postId);
			setCommentsList(result);
		}
		loadComments();

	}, [postId]);

	return (
		<div className="App">
			<header className="App-header">
				<h1>خوش آمدید</h1>
				<p>سیستم نظردهی</p>
			</header>
			<Comments
				title="نظرات کاربران"
				comments={commentsList}
				setComments={setCommentsList}
			/>
		</div>
	);
}

export default App;