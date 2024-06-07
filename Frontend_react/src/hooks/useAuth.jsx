import React, { useState, useEffect, useRef } from "react";
import Keycloak from "keycloak-js";

const client = new Keycloak({
  url: "https://keycloak.proxy.devops-pse.users.h-da.cloud/",
  realm: "group4",
  clientId: "myclient",
});

const useAuth = () => {
  const isRun = useRef(false);
  const [token, setToken] = useState(null);
  const [isLogin, setLogin] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (isRun.current) return;

    isRun.current = true;
    client
      .init({
        onLoad: "login-required",
      })
      .then((res) => {
        setLogin(res);
        setToken(client.token);
        setUserId(client.subject); // Set user ID from Keycloak
        console.log("Token:", client.token);
      })
      .catch((err) => {
        console.error("Keycloak initialization failed", err);
      });
  }, []);

  const logout = () => {
    client.logout();
    setLogin(false);
  };
  return [isLogin, token, userId, logout];
};

export default useAuth;

