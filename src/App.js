import './App.css';

function App() {
  return (
    process.env.REACT_APP_WS_ENDPOINTS.split(",").map(wsEndpoint => (
      <div class="jsmpeg" data-url={"ws://" + window.location.host + wsEndpoint}></div>
    ))
  );
}

export default App;
