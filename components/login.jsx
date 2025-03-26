import { server } from "../server_addr";
import React, { useEffect, useState } from "react";
import {useNavigationState} from '@react-navigation/native';
import { Text, TextInput, View, Pressable, Image, Linking } from 'react-native';
import { styles } from "../stylesheets/styles";
import { RippleButton } from "./ripplebutton";
import logo from "../assets/logonobg.png"
import { io } from "socket.io-client";
import { loginDB } from "../localdb";
import package_info from "../package.json";
import { Modal } from "./modal";
import eye from "../assets/eye.png";
import eyeslash from "../assets/eyeslash.png";

const fetch_version_info = (setReleaseNotes, setOutDated)=>{
    fetch(`${server}/static/release.json`).then(response=>response.json()).then(data=>{
        setReleaseNotes(data.notes);
        if(data.version != package_info.version){
            setOutDated(true);
        }
    }).catch((err)=>{
        setTimeout(()=>fetch_version_info(setReleaseNotes, setOutDated), 3000);
    })
}

export const Login = ({navigation, setSocket, setLocalUsername, setUserID, setLoginStatus}) => {
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [version, setVersion] = useState("");
    const [outDated, setOutDated] = useState(false);
    const [releaseNotes, setReleaseNotes] = useState("");
    const [openReleaseNotes, setOpenReleaseNotes] = useState(false);
    const [showpass, setShowpass] = useState(false);
    const [secure, setSecure] = useState(false);
    
    const navigationState = useNavigationState(state => state);

    useEffect(()=>{
        setVersion(package_info.version);
        fetch_version_info(setReleaseNotes, setOutDated);
    },[])

    useEffect(()=>{
        if(password==""){
            setSecure(false);
        }
    },[password])

    useEffect(()=>{
        loginDB.transaction(transaction=>{
            transaction.executeSql("SELECT * FROM credentials LIMIT 1",
            [],
            (sqlTransaction, res)=>{
                if(res.rows.length>0){
                    let item = res.rows.item(0);
                    setUsername(item.username);
                    setPassword(item.password);
                    setSecure(true);
                }
            },
            error=>{console.log(error)}
            )
        })
    },[navigationState]) //fill in credentials every time user navigates to login screen

    const handleSubmit = (e) =>{        
        if(!username || !password){
            setError("未填写用户名和密码");
            return;
        }

        setIsLoading(true);

        const request_parameters = {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password})
        };

        fetch(`${server}/api/auth`, request_parameters).then(response=>response.json()).then(data=>{
            if(data["status"] === "success"){
                setLoginStatus(true);
                setError("");
                setShowpass(false);
                setSocket(io.connect(server, {
                    query: {token:data.token}
                }));
                
                setUserID(data.ID);
                setLocalUsername(data.username);
                loginDB.transaction(transaction=>{
                    transaction.executeSql("DELETE FROM credentials", 
                    [], 
                    (sqlTransaction, res)=>{},
                    error=>{console.log(error)}
                    );

                    transaction.executeSql("INSERT INTO credentials (username, password) VALUES (?,?)",
                    [data.username, password],
                    (sqlTransaction, res)=>{},
                    error=>{console.log(error)}
                    );
                });
                navigation.navigate("Chat");
            }else if(data["status"] === "non-authenticated"){
                setError("用户名或密码错误。");
            }
            setIsLoading(false);
        }).catch((err)=>{
            setIsLoading(false);
            console.log(err);
        });
    }
    return (
        <>
            {openReleaseNotes && <Modal title={"版本信息"} content={
                <>
                    {outDated&&
                    <>
                    <Text>您的版本已过期！</Text>
                    <Pressable style={styles.link} onPress={()=>{Linking.openURL("https://www.mcsheepchat.com")}}><Text style={{color:"blue"}}>请在www.mcsheepchat.com下载最新版本。</Text></Pressable>
                    </>}
                    <View style={{margin:5, backgroundColor:"#d4d1cd", padding:10, borderRadius:4}}>
                        <Text>{releaseNotes}</Text>
                    </View>
                </>
            } close_func={()=>setOpenReleaseNotes(false)} ></Modal>}
            <View style={styles.login_container}>
                <View style={styles.main_logo}>
                    <Image source={logo} style={{width:'100%', height:'100%'}}></Image>
                </View>
                
                <Text style={styles.text}>用户名或者电子邮箱</Text>
                <TextInput onChangeText={(text)=>{setUsername(text)}} value={username} style={styles.input}></TextInput>
                <Text style={styles.text}>密码</Text>
                <View style={{"display":"flex", flexDirection:"row"}}>
                    <TextInput onChangeText={(text)=>{setPassword(text)}} value={password} style={styles.input} secureTextEntry={!showpass}></TextInput>
                    <Pressable onPress={()=>{if(!secure){setShowpass(!showpass)}}}>
                        {showpass?<Image source={eye} style={styles.tiny_icon}></Image>:<Image source={eyeslash} style={styles.tiny_icon}></Image>}
                    </Pressable>
                </View>
                <Text style={styles.error_text}>{error}</Text>
                <View style={{"display":"flex"}}>
                    <RippleButton textcolor={styles.input.color} content={isLoading?<Text style={styles.text}>加载中...</Text>:"登录"} onClick={handleSubmit}></RippleButton>
                    <Pressable style={{...styles.link,marginTop:25}} onPress={()=>{navigation.navigate('注册')}}>
                        <Text style={styles.text}>注册羊论</Text>
                    </Pressable>
                </View>
            </View>
            <Pressable style={styles.version_info} onPress={()=>setOpenReleaseNotes(true)}>
                <Text style={styles.version_text}>Sheepchat Release {version}</Text>
                <Text style={styles.version_text}>Built by Federer Y, Logo by Joey L</Text>
            </Pressable>
        </>
    )
}