import { roomId } from "./connection.js";

export function getUserName() {
  try {
    return sessionStorage.getItem(`username-${roomId}`);
  } catch (e) {
    console.warn("Couldn't fetch user name from sessionStorage.");
    return null;
  }
}

export function setUserName(name) {
  try {
    sessionStorage.setItem(`username-${roomId}`, name);
  } catch (e) {
    console.warn("Couldn't set username to sessionStorage.");
  }
}

export function getSessionToken() {
  try {
    return sessionStorage.get(`token-${roomId}`);
  } catch (e) {
    console.warn("Couldn't fetch session token from sessionStorage.");
    return null;
  }
}

export function setSessionToken(token) {
  try {
    sessionStorage.setItem(`token-${roomId}`);
  } catch (e) {
    console.warn("Couldn't set session token to sessionStorage.");
  }
}
