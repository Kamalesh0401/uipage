import { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function MessageWindow({ connection, data }) {
    const { user, chatUserName, chatUserId, connectionId } = data;
    console.log(data);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isGroup, setIsGroup] = useState(false);

    useEffect(() => {
        if (connection) {
            connection.on('ReceiveMessage', (user, message, IsGroup) => {
                setIsGroup(IsGroup);
                setMessages((prevMessages) => [...prevMessages, { user, message }]);
            });

            return () => {
                connection.off('ReceiveMessage');
            };
        }
    }, [connection]);
    useEffect(() => {
        setMessages([]);
    }, [chatUserId])

    const sendMessage = async () => {
        if (connection && connection._connectionStarted) {
            if (message !== "" && user !== "") {
                try {
                    if (chatUserId === 'GROUP') {
                        await connection.send('SendMessageToGroup', chatUserName, user, message);
                    } else {
                        await connection.send('SendMessageToClient', connectionId, chatUserId, user, message);
                    }
                    setMessage('');
                } catch (e) {
                    console.log(e);
                }
            } else {
                alert('Message or user information is missing.');
            }
        } else {
            alert('No connection to server yet.');
        }
    };

    return (
        <div className="d-flex flex-column h-100">
            <div className="border-bottom text-start fs-4 mb-3">{chatUserName}</div>
            <div className="chat-messages flex-grow-1 overflow-auto">
                {messages.reduce((acc, m, index) => {
                    if (!isGroup && (m.user !== user && m.user !== chatUserName)) {
                        return acc;
                    }
                    const isCurrentUser = m.user === user;
                    const alignmentClass = isCurrentUser ? "justify-content-end me" : "justify-content-start you";

                    return acc.concat(
                        <div className={`d-flex justify-content-${isCurrentUser ? 'end' : 'start'}`} key={index}>
                            <div className={`mb-2 mt-2 fs-5 ${alignmentClass}`}>
                                <div className="messageHead">{m.user}</div>
                                <p className="m-2 messagecls">{m.message}</p>
                            </div>
                        </div>
                    );
                }, [])}

            </div>

            <div className="message-input row mb-3">
                <div className="col-md-12 input-group">
                    <input
                        type="text"
                        className="form-control p-4"
                        id="messageInput"
                        placeholder="Enter message"
                        autoComplete="off"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                sendMessage();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="btn send position-absolute"
                        onClick={sendMessage}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </div>
        </div>
    );
}
