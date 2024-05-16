import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';

function useJsCodeExecutor() {
  const [outputs, setOutputs] = useState([]);
  const [error, setError] = useState('');

  const executeJsCode = (jsCode) => {
    setError('');
    try {
      // Clear existing outputs
      setOutputs([]);

      // Capture console output
      const originalConsoleLog = console.log;
      console.log = (message) => {
        setOutputs((prevOutputs) => [...prevOutputs, { output: message }]);
      };

      // Execute JavaScript code
      eval(jsCode);

      // Restore original console.log function
      console.log = originalConsoleLog;
    } catch (error) {
      setError('Error during execution: ' + error.message);
    }
  };

  return { outputs, error, executeJsCode };
}

function App() {
  const [jsCode, setJsCode] = useState('');
  const { outputs, error, executeJsCode } = useJsCodeExecutor();

  return (
    <div>
      <h1>JavaScript Code Editor</h1>
      <br />
      <AceEditor
        mode="javascript"
        theme="github"
        onChange={setJsCode}
        name="js-editor"
        value={jsCode}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        width="100%"
        height="500px"
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
      <br />
      <button onClick={() => executeJsCode(jsCode)}>Execute</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h2>Output:</h2>
      <ul>
        {outputs.map((output, index) => (
          <li key={index}>{output.output}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
