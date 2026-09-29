import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { useAuth } from "./lib/auth";
import Landing from "./pages/Landing";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Studio from "./pages/Studio";
import Calendar from "./pages/Calendar";
import Competitors from "./pages/Competitors";
import Memory from "./pages/Memory";
import Setup from "./pages/Setup";
import Ship from "./pages/Ship";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/app/*"
        element={
          <AuthGate>
            <Shell>
              <Routes>
                <Route index element={<Navigate to="chat" replace />} />
                <Route path="chat" element={<Chat />} />
                <Route path="studio" element={<Studio />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="competitors" element={<Competitors />} />
                <Route path="memory" element={<Memory />} />
                <Route path="ship" element={<Ship />} />
                <Route path="setup" element={<Setup />} />
                <Route path="*" element={<Navigate to="chat" replace />} />
              </Routes>
            </Shell>
          </AuthGate>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
