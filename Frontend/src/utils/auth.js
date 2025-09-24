export const getCurrentUserId = () => localStorage.getItem("userId");
export const getCurrentUserName = () => localStorage.getItem("userName");
export const logoutUser = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
};
