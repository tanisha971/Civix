import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MailIcon from '@mui/icons-material/Mail';
import LoginImage from "../../assets/images/govImg.jpeg";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form,
        { withCredentials: true }
      );
      alert(res.data.message);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-blue-200 flex justify-center items-center">
      <div className="flex max-w-4xl w-full h-[85vh] bg-white rounded-lg shadow-lg overflow-hidden mx-auto ">
        
        {/* Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-extrabold text-blue-600">Welcome to Civix</h1>
            <p className="text-gray-500 text-sm mt-2">Join our platform to make your voice heard in local governance</p>
          </div>

          <form className="flex flex-col space-y-4 mt-4" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              variant="outlined"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <MailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              fullWidth
            />

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
              Sign In
            </button>

            <p className="text-center text-gray-500 text-sm mt-2">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">Register now</Link>
            </p>
          </form>
        </div>

        {/* Image */}
        <div className="flex-1 bg-cover bg-center hidden md:block"
             style={{ backgroundImage: `url(${LoginImage})`, borderTopLeftRadius: 60, borderBottomLeftRadius: 60 }}>
        </div>
      </div>
    </div>
  );
}
