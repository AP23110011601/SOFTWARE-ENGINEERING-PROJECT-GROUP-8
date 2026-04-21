

// 🔐 Get token (later from login)
const getToken = () => {
  return localStorage.getItem("token");
};

// 📡 Fetch recommendations
export const getRecommendations = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/recommendations`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};
