import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUser } from '@fortawesome/free-solid-svg-icons';

export default function FriendList({ connection, data }) {
    const { user, chatUserId, setChatUserId, setchatUserName, activeUser, setActiveUsers } = data;
    console.log(data);

    useEffect(() => {
        if (connection) {
            console.log('Connected!');

            const handleAddUser = (list) => {
                setActiveUsers(list.filter(ex => ex.username !== user));
            };

            connection.on('ActiveUsersList', handleAddUser);

            return () => {
                connection.off('AddUser', handleAddUser);
                connection.off('AddNewGroup');
            };
        }
    }, [connection]);

    function userSelect(connectionId, name) {
        if (connectionId !== chatUserId) {
            setChatUserId(connectionId);
            setchatUserName(name);
        }
    }
    function GroupSelect(name) {
        setChatUserId('GROUP');
        setchatUserName(name);
    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-start">
            {activeUser.map((ex, index) => {
                if (ex.group !== null) {
                    return (<div className="p-3 w-100 cursor-click text-start" key={index} onClick={(e) => GroupSelect(ex.username)}><FontAwesomeIcon icon={faUsers} />{ex.username}</div>
                    )
                } else {
                    return (<div className="p-3 w-100 cursor-click text-start" key={index} onClick={(e) => userSelect(ex.connectionId, ex.username)}><FontAwesomeIcon icon={faUser} />{ex.username}</div>
                    )
                }
            })}
        </div>
    )
}
