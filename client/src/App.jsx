import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import AuthPage from './pages/authPage';
import Dashboard from './pages/dashboard';

function App() {
  return (
    <Router>
      <Routes>
        // Public Route for Authentication
        <Route path="/auth" element={<AuthPage />} />

        // Protected Route for Home
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;