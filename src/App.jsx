import './App.css';
import { StoreProvider } from './context/StoreProvider';
import { POSDashboard } from './components/POSDashboard';

function App() {
  return (
    <StoreProvider>
      <POSDashboard />
    </StoreProvider>
  );
}

export default App;
