import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";

{/*adm*/}
import RoomsPage from "./pages/adm/RoomsPage";
import DashboardADM from "./pages/adm/dashboardADM";
import Guests from "./pages/adm/guests"
import UsersAdm from "./pages/adm/usersAdm"
import SchedulingAdm from "./pages/adm/schedulingAdm"

{/*usuario*/}
import UserPage from "./pages/user/userPage";


import Layout from "./components/layout/layout";

import "./App.css";

import UserProvider from "./lib/userProvider"; {/*Tirar quando tiver autenticação real */}

function App() {
  return (
    <UserProvider> {/* Utilizado para autenticação mockada enquanto não tem banco */}
    <BrowserRouter>
      <Routes>

        {/* Sem layout */}
        <Route path="/" element={<Login />} />

        {/* Com layout */}
        <Route element={<Layout />}>
          {/*ADM */}
          <Route path="/homeAdm" element={<DashboardADM />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/usersAdm" element={<UsersAdm />} /> 
          <Route path="/schedulingAdm" element={<SchedulingAdm />} />


          {/*Usuario */}
          <Route path="/user" element={<UserPage />} />

        </Route>

      </Routes>
    </BrowserRouter>
    </UserProvider>
  );
}

export default App;