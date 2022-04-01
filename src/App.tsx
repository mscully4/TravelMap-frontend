import { useEffect, useState } from "react";
import { ThemeProvider } from "@material-ui/core";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import User from "./views/User";
import Home from "./views/Home";
import Header from "./components/Header";
import { lightTheme } from "./utils/colors";
import {
  refreshTokens,
  getEpochTime,
  objectKeysSnakeCasetoCamelCase,
  setTokensInLocalStorage,
} from "./utils/backend";
import { LoginResponse } from "./types/loginResponse";

import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.lastAuthUser) {
      // If the token has expired, get a new one
      if (localStorage.refreshAfter < getEpochTime()) {
        refreshTokens(localStorage.lastAuthUser)
          .then((resp) => {
            if (resp.ok) {
              resp.json().then((json) => {
                const loginResponse: LoginResponse =
                  objectKeysSnakeCasetoCamelCase(json);
                setTokensInLocalStorage(
                  localStorage.lastAuthUser,
                  loginResponse
                );
                setIsLoggedIn(true);
                setLoggedInUser(localStorage.lastAuthUser);
              });
            }
          })
          .catch((error) => {
            localStorage.clear();
          });
      }
      // Otherwise use the existing token
      else {
        setIsLoggedIn(true);
        setLoggedInUser(localStorage.lastAuthUser);
      }
    }
  });

  return (
    <ThemeProvider theme={lightTheme}>
      <Header
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        loggedInUser={loggedInUser}
        setLoggedInUser={setLoggedInUser}
      />
      <BrowserRouter>
        <Routes>
          <Route
            path="/:user"
            element={
              <User isLoggedIn={isLoggedIn} loggedInUser={loggedInUser} />
            }
          />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
