import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AgentCockpit from './features/Agentcorkpit/Agentcockpit';
import Login from './components/Login/Login';
import './App.css';
import AddSchool from './components/Addschool/Addschool';
import Addadminuser from './components/Addadminuser/Addadminuser';
import useSchoolStore from './store/Schooldata';

// Main App Component
function App() {
  const queryClient = new QueryClient();
  const schools = useSchoolStore((state) => state.schools);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Agent Cockpit with nested routes */}
          <Route path="/agent/cockpit/*" element={<AgentCockpit />} />
          
          {/* Login route */}
          <Route path="/" element={<Login />} />
          
          {/* Conditional routes based on schools data */}
          <Route 
            path="/create/account" 
            element={
              schools.length === 0 ? 
                <AddSchool /> : 
                <Navigate to="/create/admin" replace />
            } 
          />
          
          <Route 
            path="/create/admin" 
            element={
              schools.length > 0 ? 
                <Addadminuser /> : 
                <Navigate to="/create/account" replace />
            } 
          />
          
          {/* Catch-all route for unknown paths */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;