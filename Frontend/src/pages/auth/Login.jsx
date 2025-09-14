import { useState } from "react";
import { Link } from "react-router-dom";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import MailIcon from '@mui/icons-material/Mail';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginImage from "../../assets/images/govImg.jpeg"; // <-- import the image
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
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
    if (hasNumber(form.password)) {
      setError("Password cannot contain numbers.");
      return;
    }
    // Login successful
    alert("Login successful!");
    navigate("/dashboard");
  };

  return (
    // Container 1
    <div className="min-h-screen bg-blue-200 flex justify-center items-center">
      {/* Container 2 */}
      <div className="flex max-w-4xl w-full h-[85vh] bg-white rounded-lg shadow-lg overflow-hidden mx-auto ">
        

        {/* Left Form Section */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-extrabold text-blue-600">Welcome to Civix</h1>
            <p className="text-gray-500 text-sm mt-2">
              Join our platform to make your voice heard in local governance
            </p>
          </div>

          <form className="flex flex-col space-y-4 mt-4" onSubmit={handleSubmit}>
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
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              Sign In
            </button>

            

            <p className="text-center text-gray-500 text-sm mt-2">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Register now
              </Link>
            </p>
          </form>
        </div>
        {/* Right Image Section */}
        <div
          className="flex-1 bg-cover bg-center hidden md:block"
          style={{ 
            backgroundImage: `url(${LoginImage})`,
            borderTopLeftRadius: 60,
            borderBottomLeftRadius: 60,
          }} // <-- use imported image
        ></div>
      </div>
    </div>
  );
}