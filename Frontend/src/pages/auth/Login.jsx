import { useState } from "react";
import { Link } from "react-router-dom";
import LoginImage from "../../assets/images/govImg.jpeg"; // <-- import the image

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Login successful!");
  };

  return (
    <div className="flex max-w-4xl h-[85vh] bg-white rounded-lg shadow-lg overflow-hidden mx-auto my-10">
      {/* Left Image Section */}
      <div
        className="flex-1 bg-cover bg-center hidden md:block"
        style={{ backgroundImage: `url(${LoginImage})` }} // <-- use imported image
      ></div>

      {/* Right Form Section */}
      <div className="flex-1 p-8 flex flex-col justify-center">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-extrabold text-blue-600">Welcome to Civix</h1>
          <p className="text-gray-500 text-sm mt-2">
            Join our platform to make your voice heard in local governance
          </p>
        </div>

        <form className="flex flex-col space-y-4 mt-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Sign In
          </button>

          <div className="relative text-center my-3 text-gray-400 text-xs">
            <span className="bg-white px-2 absolute left-1/2 -translate-x-1/2 top-1/2">
              or sign in using
            </span>
            <div className="border-t border-gray-300"></div>
          </div>

          <div className="flex gap-3 justify-center">
            <button className="flex-1 py-2 border border-gray-300 rounded flex items-center justify-center gap-2 hover:bg-gray-100">
              <i className="fab fa-google"></i> Google
            </button>
            <button className="flex-1 py-2 border border-gray-300 rounded flex items-center justify-center gap-2 hover:bg-gray-100">
              <i className="fab fa-facebook-f"></i> Facebook
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Register now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}