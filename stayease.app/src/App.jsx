import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Login from "./pages/login";

{/*adm*/}
import RoomsPage from "./pages/adm/RoomsPage";
import DashboardADM from "./pages/adm/dashboardADM";
import Guests from "./pages/adm/guests"
import UsersAdm from "./pages/adm/usersAdm"
import SchedulingAdm from "./pages/adm/schedulingAdm"

{/*usuario*/}
import UserPage from "./pages/user/userPage";
import RoomDetail from "./pages/user/roomDetail.$id"
import BookinForm from "./pages/user/bookinForm"
import MyBookin from "./pages/user/myBookin"
import BookinDetail from "./pages/user/bookinDetail.$id"
import Checkout from "./pages/user/checkout.$id"
import Checkin from "./pages/user/checkin.$id"
import RoomList from "./pages/user/roomList"

import Layout from "./components/layout/layout";
import ProtectedRoute from "./components/layout/protectedRoute";

import "./App.css";

import UserProvider from "./lib/userProvider";
import { FRONT_DESK_ROLES, ROLES, STAFF_ROLES } from "./lib/authSession";

function App() {
  return (
    <UserProvider>
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>

        {/* Sem layout */}
        <Route path="/" element={<Login />} />

        {/* Com layout: exige usuário logado */}
        <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/*ADM */}
          <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
            <Route path="/homeAdm" element={<DashboardADM />} />
          </Route>
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/usersAdm" element={<UsersAdm />} />
          </Route>
          <Route element={<ProtectedRoute roles={FRONT_DESK_ROLES} />}>
            <Route path="/guests" element={<Guests />} />
            <Route path="/schedulingAdm" element={<SchedulingAdm />} />
          </Route>

          {/*Usuario */}
          <Route element={<ProtectedRoute roles={[ROLES.GUEST]} />}>
            <Route path="/user" element={<UserPage />} />
            <Route path="/user/roomDetail/:id" element={<RoomDetail />} />
            <Route path="/bookin" element={<BookinForm />} />
            <Route path="/myBookin" element={<MyBookin />} />
            <Route path="/user/bookinDetail/:id" element={<BookinDetail />} />
            <Route path="/user/checkout/:id" element={<Checkout />} />
            <Route path="/user/checkin/:id" element={<Checkin/>} />
            <Route path="/roomList" element={<RoomList />} />
          </Route>

        </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
    </UserProvider>
  );
}

export default App;