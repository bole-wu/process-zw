import React from 'react';
import logo from './logo.svg';
import './App.css';
import Index from "./components/index";
import CustomProcess from './components/CustomProcess';
import Message from './components/Message';
function App() {
  return (
    <div className="App">
      {/* <Index /> */}
      {/* <h1>流程图应用</h1> */}
      {/* <CustomProcess /> */}
      <CustomProcess />
      <div style={{ padding: '20px' }}>
        <h2>消息发送示例</h2>
        <Message />
      </div>
    </div>
  );
}

export default App;
