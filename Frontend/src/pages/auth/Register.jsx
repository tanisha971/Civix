import { useState } from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import RegisterImage
  from '../../assets/images/govImg.jpeg'; // <-- import the image
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import MailIcon from '@mui/icons-material/Mail';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PlaceIcon from '@mui/icons-material/Place';

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

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
      

  const hasNumber = (str) => /\d/.test(str);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
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
    // Registration successful
    alert("Registration successful!");
    navigate("/dashboard");
  };

  return (
    // Container 1
    <div className="min-h-screen bg-blue-200 flex justify-center items-center">
      {/* Container 2 */}
      <div className="flex max-w-4xl h-[85vh] w-full bg-white rounded-lg shadow-lg overflow-hidden mx-auto ">
        {/* Left Image Section */}
        <div
          className="flex-1 bg-cover bg-center hidden md:block"
          style={{ 
            backgroundImage: `url(${RegisterImage})`,
            borderTopRightRadius: 60,
            borderBottomRightRadius: 60, }} // <-- use imported image
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
            <TextField
                          id="name"
                          label="name"
                          variant="outlined"
                          type="text"
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
                          id="email"
                          label="Email"
                          variant="outlined"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          fullWidth
                          sx={{ mb: 2 }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <MailIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
            <TextField
              id="password"
              label="Password"
              variant="outlined"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              id="location"
              label="Location"
              variant="outlined"
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PlaceIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Role Selection */}
            <div className="flex flex-col space-y-2">
              <label className="font-medium text-gray-700">I am registering as:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="citizen"
                    checked={form.role === "citizen"}
                    onChange={() => setForm({ ...form, role: "citizen" })}
                    className="accent-blue-600"
                  />
                  Citizen
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="public-official"
                    checked={form.role === "public-official"}
                    onChange={() => setForm({ ...form, role: "public-official" })}
                      
                  />
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
                  Public Official
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              Sign Up
            </button>

            

            {/* Switch to Login */}
            <p className="text-center text-gray-500 text-sm mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}