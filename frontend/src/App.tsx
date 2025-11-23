import React, { useEffect } from 'react';
import { useState, } from 'react';
import Comments from './components/Comments';
import { Comment } from './types/comments';
import './App.css';
import { getCommentsForPost, getPostCard } from './services/commentService';
import { stringify } from 'querystring';
import { Post } from './types/posts';
import { PostCard } from './components/Posts/PostFeed';

async function loadComments() {
	const comments = await getCommentsForPost(1);
}

function App() {
	// 1 for now
	const postId: number = 1;

	const [commentsList, setCommentsList] = useState<Comment[]>([]);
	const [currentPost, setCurrentPost] = useState<Post>({
		"comments": 0,
		"content": "",
		"id": 0,
		"user": {
			avatar: "",
			id: 0,
			name: "",
			username: ""
		},
		"timestamp": "",
		"likes": 0,
		dislikes: 0,
	});

	useEffect(() => {
		async function loadComments() {
			const result = await getCommentsForPost(postId);
			setCommentsList(result);
		}
		async function loadPostCard() {
			const result = await getPostCard(postId);
			setCurrentPost(result);
		}
		loadComments();
		loadPostCard();
		
	}, [postId]);

	return (
		<div className="App">
			<header className="App-header">
				<h1>خوش آمدید</h1>
				<p>سیستم نظردهی</p>
			</header>
			<PostCard
			post={currentPost}
			onLike={() => {}}
			onDislike={() => {}}
			onComment={() => {}}
			/>
			<Comments
				title="نظرات کاربران"
				comments={commentsList}
				setComments={setCommentsList}
			/>
		</div>
	);
}

export default App;