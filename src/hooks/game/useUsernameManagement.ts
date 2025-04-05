
import { useState, useEffect } from "react";

export const useUsernameManagement = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("passwordGameUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    localStorage.setItem("passwordGameUsername", newUsername);
  };

  return {
    username,
    setUsername,
    handleUsernameChange
  };
};
