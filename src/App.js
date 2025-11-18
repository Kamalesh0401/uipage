import './App.css';
import { useState, useEffect, useContext, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import FriendList from './FriendList';
import MessageWindow from './MessageWindow';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [connection, setConnection] = useState(null);
  const [connectionId, setConnectionId] = useState(null);
  const [user, setUser] = useState(null);
  const [chatUserId, setChatUserId] = useState(null);
  const [chatUserName, setchatUserName] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeUser, setActiveUsers] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const grpname = useRef(null);
  const states = { chatUserName, setchatUserName, chatUserName, setchatUserName, chatUserId, setChatUserId, user, setUser, connectionId, setConnectionId, connection, setConnection, activeUser, setActiveUsers }
  console.log(activeUser);
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7069/chat')
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => {
        console.log('Connected to SignalR!');
        setConnectionId(newConnection.connectionId);
        setConnection(newConnection);
      })
      .catch(e => console.log('Connection failed: ', e));

  }, []);
  async function setUserC(e) {
    console.log(e);
    if (e.target.value === "" || e.target.value === null) {
      alert("Enter User Name");
      return;
    }
    setUser(e.target.value);
    if (connection && connection._connectionStarted) {
      try {
        await connection.send('Authenticate', e.target.value, connectionId);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert('No connection to server yet.');
    }
  }
  function handleGrpBtn() {
    setGroupMembers(state => [{ Username: user, ConnectionId: connectionId }])
    setIsModalOpen(true);
  }
  function onCheckChange(e) {
    if (e.target.checked) {
      setGroupMembers(state => [...state, { Username: e.target.name, ConnectionId: e.target.id }])
    } else {
      setGroupMembers(state => state.filter(ex => ex.ConnectionId !== e.target.id))
    }
  }
  async function clickGroupOk(e) {
    if (connection && connection._connectionStarted) {
      if (grpname.current.value === "" || grpname.current.value === null) {
        alert("Enter Group Name");
        return;
      }
      try {
        await connection.send('CreateGroup', grpname.current.value, groupMembers);
        setIsModalOpen(false);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert('No connection to server yet.');
    }
  }
  const handleCloseModal = (e) => {
    if (e.target.classList.contains('modal')) {
      setIsModalOpen(false);
    }
  };
  return (
    <div className="App">
      {(user === null || user === "") ?
        <>
          <div className='row justify-content-center align-items-center'>
            <h2></h2>
            <div className='justify-content-center align-items-center'>
              <div className='row col-md-6 mb-5'>
                <label className='form-label' for="group">Enter User Name : </label>
                <input
                  type="text"
                  className="p-2"
                  id="messageInput"
                  placeholder="Enter User Name"
                  value={user}
                  autoComplete='off'
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setUserC(e);
                    }
                  }}
                />
              </div>
              <div className='row col-md-6'>
                <label className='form-label' for="group">Choose a Group:</label>
                <select name="group" id="group">
                  <option value="Study">Study</option>
                  <option value="Game">Game</option>
                  <option value="Politics">Politics</option>
                  <option value="Gossips">Gossips</option>
                </select>
              </div>
            </div>
          </div>
        </> :
        <>
          <div className='container-fluid'>
            <div className='row'>
              <div id='friendList' className='col-md-3 d-flex flex-column'>
                <div className='h-100'>
                  <FriendList data={states} connection={connection} />
                </div>
                <div className='row'>
                  <div className='col-md-6 text-start'>Logged in as <strong>{user}</strong></div>
                  <div className="col-md-6 mb-2 d-flex justify-content-end">
                    <button onClick={handleGrpBtn} className="btn btn-primary">Create a Group</button>
                  </div>
                </div>
              </div>
              <div id='messageWindow' className='col-md-9'>
                {chatUserId !== null ? < MessageWindow data={states} connection={connection} /> : ""}
              </div>
            </div>
          </div>
        </>
      }
      {isModalOpen && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content">
            <span className="close-button" onClick={() => setIsModalOpen(false)}>
              &times;</span>
            <h2>Create a Group</h2>
            <input className='form-control mb-2 mt-2' ref={grpname}></input>
            {activeUser.filter(ex => ex.group === null).map(ex => <div className='mb-2'>
              <input
                type="checkbox"
                id={ex.connectionId}
                name={ex.username}
                onChange={onCheckChange}
              />
              <label htmlFor={ex.connectionId}>{ex.username}</label>
            </div>)}

            <button onClick={clickGroupOk} className='btn btn-primary'>Ok</button>
            {/* Add your modal content here */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
