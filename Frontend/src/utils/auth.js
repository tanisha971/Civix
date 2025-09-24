export const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?._id || null;
  } catch {
    return null;
  }
};
