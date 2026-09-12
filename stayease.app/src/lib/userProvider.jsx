import { useState } from "react";
import UserContext from "./userContext";

function UserProvider({ children }) {
  const [perfil, setPerfil] = useState(null);

  const login = (tipo) => {
    setPerfil(tipo);
  };

  const logout = () => {
    setPerfil(null);
  };

  return (
    <UserContext.Provider
      value={{
        perfil,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;