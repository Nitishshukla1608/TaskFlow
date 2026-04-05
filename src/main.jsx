import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // Isse correct kiya
import { Provider } from 'react-redux'
import { store } from './Context/store/store.jsx'

// createRoot ko directly use karein (ReactDOM ki zaroorat nahi agar import upar hai)
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);