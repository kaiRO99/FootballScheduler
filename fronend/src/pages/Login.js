import React from "react";

/**
 * login page
 */
const Login = () => {
  const handleGoogleLogin = () => {
    // Redirect the user to Google OAuth login
    window.location.href = "http://localhost:8000/auth/google"; // Backend route for Google OAuth
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
