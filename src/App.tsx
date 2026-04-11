import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthScreen from "./screens/auth/AuthScreen";
import Dashboard from "./pages/Dashboard";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={!isLoggedIn ? <AuthScreen /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/auth" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
