// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   return (
//     <div className="text-3xl font-bold text-center text-pink-500 p-10">
//       💖 U&I is Tailwind Ready!
//     </div>
//   );
// }

// export default App;


// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
// Import other pages as needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Add protected routes (e.g., dashboard) here */}
      </Routes>
    </Router>
  );
}

export default App;
