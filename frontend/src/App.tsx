import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import {Main} from './pages/Main/main'
import RegisterPage from './pages/Login/login'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Main/>}/>
          <Route path='/Login' element={<RegisterPage/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
