import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import RoomsPage from "./pages/RoomsPage";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/quartos" element={<RoomsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;