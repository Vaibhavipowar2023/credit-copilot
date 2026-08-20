import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Upload from "./pages/Upload";
import Covenants from "./pages/Covenants";
import Risk from "./pages/Risk";
import Borrowers from "./pages/Borrowers";
import Loans from "./pages/Loans";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/covenants" element={<Covenants />} />
            <Route path="/risk" element={<Risk />} />
            <Route path="/borrowers" element={<Borrowers />} />
            <Route path="/loans" element={<Loans />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
