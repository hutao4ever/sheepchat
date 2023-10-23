import React, { useEffect, useState } from "react";
import {useNavigationState} from '@react-navigation/native';
import { Text, TextInput, View, Pressable, Image } from 'react-native';
import { styles } from "../styles";
import { RippleButton } from "./ripplebutton";
import logo from "../assets/logonobg.png"
import { io } from "socket.io-client";
import { LoadIndicator } from "./loadindicator";
import { openDatabase } from "react-native-sqlite-storage";

const loginDB = openDatabase({
    name:'credentials'
});
loginDB.transaction(transaction=>{
    transaction.executeSql("CREATE TABLE IF NOT EXISTS credentials (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(50), password VARCHAR(50))",
    [],
    (sqlTransaction, res)=>{},
    error=>{console.log(error)}
    )
})

export const Login = ({navigation, server, setSocket, setLocalUsername, setLoginStatus}) => {
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigationState = useNavigationState(state => state);

    useEffect(()=>{
        loginDB.transaction(transaction=>{
            transaction.executeSql("SELECT * FROM credentials LIMIT 1",
            [],
            (sqlTransaction, res)=>{
                if(res.rows.length>0){
                    let item = res.rows.item(0);
                    setUsername(item.username);
                    setPassword(item.password);
                }
            },
            error=>{console.log(error)}
            )
        })
    },[navigationState])

    const handleSubmit = (e) =>{
        /*
        if(!username || !password){
            //setError("未填写用户名或密码");
            fetch(`${server}/api/token`).then(response=>response.json()).then(
                data=>{
                    if(data["status"] === "success"){
                        setLoginStatus(true);
                        setSocket(io.connect(server, {
                            query: {token:data.token}
                        }));
                        console.log(data);
                        setLocalUsername(data.username);
                        navigation.navigate("Chat");
                    }
                }
            )
            return;
        }*/
        
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
                setSocket(io.connect(server, {
                    query: {token:data.token}
                }));
                
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
            <View style={styles.login_container}>
                
                <View style={styles.main_logo}>
                    <Image source={logo} style={{width:80, height:80}}></Image>
                </View>
                
                {isLoading? 
                <LoadIndicator />:
                <><Text style={styles.text}>用户名或者电子邮箱</Text>
                <TextInput onChangeText={(text)=>{setUsername(text)}} value={username} style={styles.input}></TextInput>
                <Text style={styles.text}>密码</Text>
                <TextInput onChangeText={(text)=>{setPassword(text)}} value={password} style={styles.input} secureTextEntry={true}></TextInput>
                <Text style={styles.error_text}>{error}</Text>
                <View style={{"display":"flex"}}>
                    <RippleButton content={"登录"} onClick={handleSubmit}></RippleButton>
                    <Pressable style={styles.link} onPress={()=>{navigation.navigate('注册')}}>
                        <Text style={styles.text}>注册羊论</Text>
                    </Pressable>
                </View></>}
            </View>
            <View style={styles.version_info}>
                <Text style={styles.version_text}>Sheepchat 114.51.4</Text>
                <Text style={styles.version_text}>Built by Federer Y, Logo by Joey L</Text>
            </View>
        </>
    )
}