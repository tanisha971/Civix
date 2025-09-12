import { useState } from "react";
import { Link } from "react-router-dom";
import LoginImage from "../../assets/images/image.jpg";

export default function Login() {
  // Use a single state object instead of multiple useState calls
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing in a field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  // Validation rules
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Clear any previous errors
    setErrors({});
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      alert("Login successful!");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex max-w-4xl h-[95vh] bg-white rounded-lg shadow-lg overflow-hidden mx-auto my-10">
      {/* Left Image Section */}
      <div
        className="flex-1 bg-cover bg-center hidden md:block"
        style={{ backgroundImage: `url(${LoginImage})` }}
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
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>

          <div className="relative text-center my-3 text-gray-400 text-xs">
            <span className="bg-white px-2 absolute left-1/2 -translate-x-1/2 top-1/2">
              or sign in using
            </span>
            <div className="border-t border-gray-300"></div>
          </div>

          <div className="flex gap-3 justify-center">
            <button 
              type="button"
              className="flex-1 py-2 border border-gray-300 rounded flex items-center justify-center gap-2 hover:bg-gray-100"
            >
              <i className="fab fa-google"></i> Google
            </button>
            <button 
              type="button"
              className="flex-1 py-2 border border-gray-300 rounded flex items-center justify-center gap-2 hover:bg-gray-100"
            >
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