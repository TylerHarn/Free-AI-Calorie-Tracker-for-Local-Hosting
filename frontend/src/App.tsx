import { useEffect, useState } from "react";
import { getMe, type User } from "./api";
import LoginPage from "./components/LoginPage";
import ProgressPage from "./components/ProgressPage";
import SetupPage from "./components/SetupPage";
import TrackerPage from "./components/TrackerPage";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

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

  if (user.daily_calorie_goal == null || isEditingGoal) {
    return (
      <SetupPage
        user={user}
        onComplete={(updated) => {
          setUser(updated);
          setIsEditingGoal(false);
        }}
        onCancel={isEditingGoal ? () => setIsEditingGoal(false) : undefined}
      />
    );
  }

  if (showProgress) {
    return <ProgressPage user={user} onBack={() => setShowProgress(false)} />;
  }

  return (
    <TrackerPage
      user={user}
      onSignOut={() => setUser(null)}
      onEditGoal={() => setIsEditingGoal(true)}
      onShowProgress={() => setShowProgress(true)}
    />
  );
}
