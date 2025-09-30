export const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    // Check for both id and _id to be more robust
    return user?.id || user?._id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};
