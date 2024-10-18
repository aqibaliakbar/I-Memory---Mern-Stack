export const isLoggedIn = () => {
  const token = localStorage.getItem("authToken");
  const expiration = localStorage.getItem("tokenExpiration");

  if (!token) return false;

  if (expiration) {
    return new Date(expiration) > new Date();
  }

  return true; // If there's no expiration, assume the token is valid
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("tokenExpiration");
};
