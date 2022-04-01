import CreateUserModel from "../types/createUser"
import Destination from "../types/destination"
import Login from "../types/login"
import { LoginResponse } from "../types/loginResponse"
import Place from "../types/place"
import ResendVerificationCode from "../types/resendVerificationCode"
import VerifyUser from "../types/verifyUser"

export const API_BASE = 'https://5ng5r77che.execute-api.us-west-2.amazonaws.com/prod'
export const API_AUTH = `${API_BASE}/auth`
export const API_DESTINATIONS = `${API_BASE}/destinations`
export const API_PLACES = `${API_BASE}/places`
export const API_PHOTOS = `${API_BASE}/photos`
export const API_ALBUMS = `${API_BASE}/albums`

export const objectKeysSnakeCasetoCamelCase = (obj: object) => {
  const processVal = val => (
    typeof val !== 'object' ? val : Array.isArray(val) ? val.map(objectKeysSnakeCasetoCamelCase) : objectKeysSnakeCasetoCamelCase(val)
  );

  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, val]) => [
        key.replace(/_(.)/g, g => g[1].toUpperCase()),
        processVal(val)
      ])
  )
}

export const objectKeysCamelCaseToSnakeCase = (obj: object) => {
  const processVal = val => (
    typeof val !== 'object' ? val : Array.isArray(val) ? val.map(objectKeysCamelCaseToSnakeCase) : objectKeysCamelCaseToSnakeCase(val)
  );

  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
      processVal(val)
    ])
  )
}

export const getEpochTime = () => (Date.now() / 1000)

export const setTokensInLocalStorage = (username: string, loginResponse: LoginResponse) => {
  localStorage.setItem("lastAuthUser", username)
  localStorage.setItem("accessToken", loginResponse.accessToken)
  localStorage.setItem("idToken", loginResponse.idToken)
  localStorage.setItem("refreshToken", loginResponse.refreshToken)
  localStorage.setItem("tokenType", loginResponse.tokenType)
  localStorage.setItem("refreshAfter", loginResponse.refreshAfter.toString())
}

export const getIdToken = () : string  => {
  return localStorage.idToken;
}

export const getRefreshToken = () : string => {
  return localStorage.refreshToken;
}

// Auth Functions
export const userLogin = (data: Login) => {
  return fetch(`${API_AUTH}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
}

export const userSignUp = (data: CreateUserModel) => {
  return fetch(`${API_AUTH}/create_user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
}

export const verifyUser = (data: VerifyUser) => {
  return fetch(`${API_AUTH}/verify_user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
}

export const resendVerificationCode = (data: ResendVerificationCode) => {
  console.log(data)
  return fetch(`${API_AUTH}/resend_verification_code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
}

export const refreshTokens = (username: string) => {
  return fetch(`${API_AUTH}/refresh_tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      refresh_token: getRefreshToken(),
      username: username
    })
  })
}

// Destinations
export const getDestinations = (user: string) => {
  return fetch(`${API_DESTINATIONS}?user=${user}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const postDestination = (destination: Destination) => {
  return fetch(API_DESTINATIONS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": getIdToken()
    },
    body: JSON.stringify(objectKeysCamelCaseToSnakeCase(destination))
  })
}

export const deleteDestination = (destination: Destination) => {
  return fetch(`${API_DESTINATIONS}?place_id=${destination.placeId}`, {
    method: "DELETE",
    headers: {
      "Authorization": getIdToken()
    }
  })
}

// Place
export const getPlaces = (user: string) => {
  return fetch(`${API_PLACES}?user=${user}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
}

export const postPlace = (place: Place) => {
  return fetch(API_PLACES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": getIdToken()
    },
    body: JSON.stringify(objectKeysCamelCaseToSnakeCase(place))
  })
}

export const deletePlace = (place: Place) => {
  return fetch(`${API_PLACES}?place_id=${place.placeId}`, {
    method: "DELETE",
    headers: {
      "Authorization": getIdToken()
    }
  })
}
