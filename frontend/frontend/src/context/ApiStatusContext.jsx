import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config";

const ApiStatusContext = createContext();

export const useApiStatus = () => useContext(ApiStatusContext);

export const ApiStatusProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30; //30 attempts * 2 seconds = 60 seconds max

    const checkApi = async () => {
      try {
        const response = await fetch(`${API_URL}/`, {
          method: "GET",
          signal: AbortSignal.timeout(5000)
        });
        if (response.ok) {
          setIsConnected(true);
          setIsChecking(false);
          return true;
        }
      } catch {
        //API not ready yet
      }
      return false;
    };

    const poll = async () => {
      const connected = await checkApi();
      if (!connected && attempts < maxAttempts) {
        attempts++;
        setTimeout(poll, 2000);
      } else if (!connected) {
        setIsChecking(false); //Stop after max attempts
      }
    };

    poll();
  }, []);

  return (
    <ApiStatusContext.Provider value={{ isConnected, isChecking }}>
      {children}
    </ApiStatusContext.Provider>
  );
};
