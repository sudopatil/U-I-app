import React, { useState } from "react";
import { register } from "../api";

const Register = () => {
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  // role: only "girlfriend" or "boyfriend"
  const [role, setRole] = useState("girlfriend");
  // Toggle state: true means first partner registration; false means with invitation code.
  const [isFirstPartner, setIsFirstPartner] = useState(true);
  const [invitationToken, setInvitationToken] = useState("");
  
  // Additional states for feedback
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Toggle registration type between first partner and invitation code mode
  const toggleRegistrationType = () => {
    setIsFirstPartner((prev) => !prev);
    // Clear invitation token when switching mode
    if (!isFirstPartner) {
      setInvitationToken("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    // Construct payload according to registration type
    const payload = {
      email,
      password,
      firstName,
      dateOfBirth, // format: "YYYY-MM-DD"
      gender,
      role,
      isFirstPartner,
      ...(isFirstPartner ? {} : { invitationToken }),
    };

    try {
      // Call the registration API
      const data = await register(payload);
      console.log("Registration successful:", data);
      
      // Set success message instructing the user to verify their email.
      setSuccessMessage("Registration successful! Please check your email for the verification link.");
      
      // Optionally, you may clear the form or redirect the user.
      // For example: clear the form fields
      setEmail("");
      setPassword("");
      setFirstName("");
      setDateOfBirth("");
      setGender("");
      setInvitationToken("");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Register</h2>
  
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}
  
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            {successMessage}
          </div>
        )}
  
        {/* Toggle button for registration mode */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={toggleRegistrationType}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            {isFirstPartner ? "Do You Have an Invitation Code?" : "Are You the First Partner?"}
          </button>
        </div>
  
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              required
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
  
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
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
  
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              required
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-6 mt-1">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  value="girlfriend"
                  checked={role === "girlfriend"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-2"
                />
                Girlfriend
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  value="boyfriend"
                  checked={role === "boyfriend"}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-2"
                />
                Boyfriend
              </label>
            </div>
          </div>
  
          {!isFirstPartner && (
            <div>
              <label htmlFor="invitationToken" className="block text-sm font-medium text-gray-700">
                Invitation Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="invitationToken"
                value={invitationToken}
                required
                onChange={(e) => setInvitationToken(e.target.value)}
                placeholder="Enter your invitation code"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
  
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white rounded-lg ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 transition"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
  
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <a href="/login" className="text-blue-600 hover:underline ml-1">
            Login
          </a>
        </p>
      </div>
    </div>
  );
  
};

export default Register;
