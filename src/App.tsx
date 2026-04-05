// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  // Zustand 스토어에서 로그인 상태를 가져옵니다.
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 안 되어 있으면 무조건 /auth로, 되어 있으면 메인(/)으로 */}
        <Route
          path="/auth"
          element={!isLoggedIn ? <Auth /> : <Navigate to="/" />}
        />

        {/* 로그인 되어 있을 때만 대시보드 접근 가능 */}
        <Route
          path="/"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/auth" />}
        />

        {/* 그 외 이상한 주소로 들어오면 메인으로 튕겨내기 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
