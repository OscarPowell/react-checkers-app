import logo from './logo.svg';
import './App.css';
import { useIdentityContext,IdentityContextProvider } from "react-netlify-identity-widget";
import "react-netlify-identity-widget/styles.css"

const IdentityModal = React.lazy(() => import("react-netlify-identity-widget"))

function App() {
  const url = "https://react-notification-app.netlify.app/";
  return (
    <IdentityContextProvider value={url}>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </IdentityContextProvider>
  );
}

function Main() {
  const identity = useIdentityContext()
  const [dialog, setDialog] = React.useState(false)
  const isLoggedIn = identity && identity.isLoggedIn
  return (
    <div className="App">
      <button className="btn" onClick={() => setDialog(isLoggedIn)}>
        {isLoggedIn ? "LOG OUT" : "LOG IN"}
      </button>
      <React.Suspense fallback="loading...">
        <IdentityModal showDialog={dialog} onCloseDialog={() => setDialog(false)} />
      </React.Suspense>
    </div>
  )
}



export default App;
