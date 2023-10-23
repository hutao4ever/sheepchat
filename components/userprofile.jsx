import { useRef, useState } from "react"
import { useSpring, animated } from '@react-spring/web'
import { Modal } from "./modal"

export const UserProfile = ({username, setUsername, setLoginStatus})=>{
    const [profileVisible, toggle] = useState(false);
    const [updater, setUpdater] = useState(114514);
    const [openUsernameModal, setOpenUsernameModal] = useState(false);
    const [usernameErr, setUsernameErr] = useState();
    var newUsernameInput = useRef();
    var picture = useRef();

    const props = useSpring({
        from:{x:0},
        to:{x:profileVisible?0:1},
        config:{
            tension:150,
            friction:15
        }
    });

    const handlePictureChange = (e)=>{
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
        
      fetch('/api/changepfp', {
        method: 'POST',
        body: formData,
      }).then(response=>{return response.json()}).then((res)=>{
        if (res["status"]=="success") {
            setUpdater(Math.random());
        }
      })
    }

    const handleUsernameChange = ()=>{
        var newUsername = newUsernameInput.current.value;
        if(newUsername.length < 2 || newUsername.length > 25){
            setUsernameErr("Username must be between 2 and 25 characters long.");
        }else if(/\s/g.test(username) || username.includes("#")){
            setUsernameErr("Username can't include spaces or hashtags.");
        }else{
            fetch('/api/editusrnm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({"username":newUsername}),
            }).then(response=>response.json()).then((res)=>{
                if (res["status"]=="success") {
                    setUsername(newUsername);
                    setUsernameErr("");
                    setOpenUsernameModal(false);
                }
            });
        }
    }

    const handleLogout = ()=>{
        fetch('/api/logout').then(()=>{
            setLoginStatus(false);
        })
    }

    return (
        <>
            {openUsernameModal && <Modal width={"200px"} title={"Changing username"} content={<><input ref={newUsernameInput} placeholder="username"/><p className="error">{usernameErr}</p></>} interactions={<button onClick={handleUsernameChange}>confirm</button>} close_func={()=>{setOpenUsernameModal(false)}} />}
            <animated.div style={{
                top: props.x.to([0,1],[0,-300]).to(value=>{return `${value}px`})
            }} className="profileContainer">
                <div>
                    <input type="file" style={{"display":"none"}} ref={picture} onChange={handlePictureChange}></input>
                    <div className="profilepic" onClick={()=>{picture.current.click()}}>
                        <img src={`/api/getpfp?u=${updater}`}></img>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-upload" viewBox="0 0 16 16">
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                        </svg>
                    </div>
                    
                    <p>Welcome! You are logged in as: {username}</p>
                    <ul>
                        <li onClick={()=>{setOpenUsernameModal(true)}}>Change username</li>
                        <li>Change password</li>
                        <li><button className="logout" onClick={handleLogout}>Logout</button></li>
                    </ul>
                </div>
                <div className="pulltab" onClick={()=>{toggle(!profileVisible)}}>
                    <p>Your profile</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="grey" class="bi bi-arrow-bar-down" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1 3.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5zM8 6a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L7.5 12.293V6.5A.5.5 0 0 1 8 6z"/>
                    </svg>
                </div>
            </animated.div>
        </>
    )
}