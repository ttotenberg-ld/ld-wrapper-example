import ldLogo from './assets/launchdarkly.svg'
import './App.css'
import LDContext from './components/ldcontext.jsx'
import LDFlag from './components/ldflag.jsx'

function App() {

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={ldLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Example Wrapper</h1>
      <LDFlag />
      <LDContext />
    </>
  )
}

export default App
