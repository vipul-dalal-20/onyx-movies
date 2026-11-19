import { HashRouter as Router } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import AppRouter from './routes/AppRouter';
import AppEntrance from './components/common/AppEntrance';

function App() {
  const [isReady, setIsReady] = useState(() => !!sessionStorage.getItem('onyx_entrance_shown'));

  const handleComplete = () => {
    setIsReady(true);
    sessionStorage.setItem('onyx_entrance_shown', 'true');
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <WatchlistProvider>
          <SettingsProvider>
            {!isReady && <AppEntrance onComplete={handleComplete} />}
            {isReady && (
              <Router>
                <AppRouter />
              </Router>
            )}
          </SettingsProvider>
        </WatchlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
