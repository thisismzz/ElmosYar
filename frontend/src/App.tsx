import React, { useEffect } from 'react';
import { useState, } from 'react';
import Comments from './components/Comments';
import { Comment } from './types/comments';
import './App.css';
import { getCommentsByPostId } from './services/commentService';

async function loadComments() {
	const comments = await getCommentsByPostId(1);
}

function App() {
	// 1 for now
	const postId: number = 1;

	const [commentsList, setComments] = useState<Comment[]>([]);

	useEffect(() => {
		const load = async () => {
			const data = await getCommentsByPostId(postId);
			setComments(data);
		};

		load();
	}, [postId]);

	return (
		<div className="App">
			<header className="App-header">
				<h1>خوش آمدید</h1>
				<p>سیستم نظردهی</p>
			</header>
			<Comments
				initialComments={commentsList}
				title="نظرات کاربران"
			/>
		</div>
	);
}

export default App;