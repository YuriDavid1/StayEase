import { useContext } from "react";

import UserContext from "./userContext";

export function useUser() {
  return useContext(UserContext);
}