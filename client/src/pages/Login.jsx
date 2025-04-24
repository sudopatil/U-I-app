// // src/pages/Login.jsx

// import React, { useState } from "react";
// import { login } from "../api";
// import { useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { setCredentials } from "../redux/slices/authSlice";

// const Login = () => {
//   // Form state
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   // For error messages and loading state
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       // Call your login API
//       const data = await login({ email, password });
//       console.log("Login successful:", data);

//       // Dispatch login credentials to Redux. This stores token, user, and partner.
//       dispatch(setCredentials(data));

//       // Optionally, you might store token in localStorage (redux-persist will also store the state)
//       // localStorage.setItem("token", data.token);

//       // Redirect to a protected route, such as a dashboard.
//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Error during login:", err);
//       setError(err.message || "An unexpected error occurred.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-[400px] bg-white p-8 rounded-2xl shadow-lg">
//         <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
  
//         {error && (
//           <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
//             {error}
//           </div>
//         )}
  
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//               Email <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               required
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
  
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Password <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               required
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
  
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 px-4 text-white rounded-lg ${
//               loading
//                 ? "bg-blue-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700 transition-colors"
//             }`}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>
  
//         <p className="mt-6 text-center text-sm text-gray-600">
//           Don’t have an account?
//           <a href="/register" className="text-blue-600 hover:underline ml-1">
//             Register
//           </a>
//         </p>
//       </div>
//     </div>
//   );  

// };

// export default Login;

import React, { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
// import truckImage from "../assets/truck.png"; // temporarily disabled until asset is added

const Login = () => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });
      dispatch(setCredentials(data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Left: Form */}
        <div className="w-full lg:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center lg:text-left">Login</h2>
          <p className="text-gray-600 text-sm mb-6 text-center lg:text-left">
            Enter your login information
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 text-white rounded-lg transition-colors ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?
            <a href="/register" className="text-blue-600 hover:underline ml-1">
              Register
            </a>
          </p>
        </div>

        { /* Right: Image panel disabled until asset is available
        <div className="hidden lg:flex lg:w-1/2 bg-gray-200 items-center justify-center p-8">
          <img src={truckImage} alt="Delivery Truck" className="max-w-full h-auto" />
        </div>
        */ }
      </div>
    </div>
  );
};

export default Login;

