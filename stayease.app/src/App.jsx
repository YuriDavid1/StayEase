import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import RoomsPage from "./pages/RoomsPage";

import Layout from "./components/layout/layout";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Sem layout */}
        <Route path="/" element={<Login />} />

        {/* Com layout */}
        <Route element={<Layout />}>

          <Route path="/quartos" element={<RoomsPage />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;