import React from 'react';
import Comments from './components/Comments';
import { Comment } from './types/comments';
import './App.css';

const initialComments: Comment[] = [
  {
    id: 1,
    name: "رضا حسینی",
    time: "ساعت پیش",
    text: "ممنون که این رو به اشتراک گذاشتهاید. من هم حتماً امتحان می‌کنم.",
    likes: 24,
    dislikes: 9
  },
  {
    id: 2,
    name: "مریم زارعی",
    time: "30 دقیقه پیش",
    text: "من این دوره رو دیدم واقعاً عالیه. پیشنهاد می‌کنم حتماً ببینید.",
    likes: 56,
    dislikes: 4
  },
  {
    id: 3,
    name: "امیر کاظمی",
    time: "10 دقیقه پیش",
    text: "آیا این دوره برای مبتدی‌ها مناسبه یا نیاز به پیش‌نیاز دارد؟",
    likes: 15,
    dislikes: 1
  }
];

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>خوش آمدید</h1>
        <p>سیستم نظردهی</p>
      </header>
      <Comments 
        initialComments={initialComments}
        title="نظرات کاربران"
      />
    </div>
  );
}

export default App;