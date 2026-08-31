import { useEffect, useState } from "react";
import { getMe, type User } from "./api";
import LoginPage from "./components/LoginPage";
import SetupPage from "./components/SetupPage";
import TrackerPage from "./components/TrackerPage";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-paper" />;
  }

  if (!user) {
    return <LoginPage onSignedIn={setUser} />;
  }

  if (user.daily_calorie_goal == null) {
    return <SetupPage user={user} onComplete={setUser} />;
  }

  return <TrackerPage user={user} onSignOut={() => setUser(null)} />;
}
