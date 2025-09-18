import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import PlaceIcon from '@mui/icons-material/Place';

import RegisterImage from '../../assets/images/govImg.jpeg';

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    role: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasNumber = (str) => /\d/.test(str);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (hasNumber(form.name)) {
      setError("Name cannot contain numbers.");
      return;
    }
    if (hasNumber(form.password)) {
      setError("Password cannot contain numbers.");
      return;
    }
    if (!form.role) {
      setError("Please select a role.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form,
        { withCredentials: true }
      );
      alert(res.data.message);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-blue-200 flex justify-center items-center">
      <div className="flex max-w-4xl h-[85vh] w-full bg-white rounded-lg shadow-lg overflow-hidden mx-auto ">
        
        {/* Left Image */}
        <div className="flex-1 bg-cover bg-center hidden md:block"
             style={{ backgroundImage: `url(${RegisterImage})`, borderTopRightRadius: 60, borderBottomRightRadius: 60 }}>
        </div>

        {/* Right Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-extrabold text-blue-600">Welcome to Civix</h1>
            <p className="text-gray-500 text-sm mt-2">Join our platform to make your voice heard in local governance</p>
          </div>

          <form className="flex flex-col space-y-4 mt-4" onSubmit={handleSubmit}>
            <TextField
              label="Name"
              variant="outlined"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <AccountCircleIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
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
            <TextField
              label="Location"
              variant="outlined"
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PlaceIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Role */}
            <div className="flex flex-col space-y-2">
              <label className="font-medium text-gray-700">I am registering as:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="citizen"
                         checked={form.role === "citizen"}
                         onChange={() => setForm({ ...form, role: "citizen" })}
                         className="accent-blue-600" /> Citizen
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="public-official"
                         checked={form.role === "public-official"}
                         onChange={() => setForm({ ...form, role: "public-official" })}
                         className="accent-blue-600" /> Public Official
                </label>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
              Sign Up
            </button>

            <p className="text-center text-gray-500 text-sm mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
