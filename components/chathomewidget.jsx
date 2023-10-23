import starticon from "../assets/starticon.png"
import {launchImageLibrary} from 'react-native-image-picker';
import { View, Image, Text, Pressable, Button } from "react-native"
import { chat } from "../chatstyles"
import { styles } from "../styles"
import { useState, useRef } from "react";
import { Modal } from "./modal";
import { TextInput } from "react-native-gesture-handler";
import { RippleButton } from "./ripplebutton";

export const ChatHome = ({server, username, setUsername, setSocket, navigation})=>{
    const [usernameModal, setUsernameModal] = useState(false);
    const [usernameErr, setUsernameErr] = useState();
    const [usernameInput, setUsernameInput] = useState();
    const [pictureErr, setPictureErr] = useState();
    const [updater, update] = useState(new Date());

    const launchNativeImageLibrary = () => {
        let options = {
          mediaType:'photo',
          selectionLimit:1
        };
        launchImageLibrary(options, async (response) => {
          if (!response.didCancel && !response.errorCode){
            const formData = new FormData();
            const file = response.assets[0];

            formData.append('image',{
                uri:file.uri,
                type:file.type,
                name:file.fileName
            })

            await fetch(`${server}/api/changepfp`, {
                method: 'POST',
                body: formData,
                headers:{
                    'Content-Type':'multipart/form-data'
                }
            }).then((res)=>res.text()).then((res)=>{
                if(res == "No file uploaded."){
                    setPictureErr("头像上传失败，请确保文件小于2MB");
                    setTimeout(()=>{setPictureErr()}, 1000);
                }else{
                    update(new Date());
                }
            }).catch((e)=>{
                console.log(e);
            });
          }
        });
      }

      const handleUsernameChange = ()=>{
        var newUsername = usernameInput;
        if(newUsername.length < 2 || newUsername.length > 25){
            setUsernameErr("用户名长度必须在2到25个字符之间");
        }else if(newUsername.includes("#")){
            setUsernameErr("用户名不能含有井号‘#’");
        }else{
            fetch(`${server}/api/editusrnm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({"username":newUsername}),
            }).then(response=>response.json()).then((res)=>{
                if (res.status=="success") {
                    setUsername(res.username);
                    setUsernameErr("");
                    setUsernameModal(false);
                }
            });
        }
    }

    const handleLogout = ()=>{
        fetch(`${server}/api/logout`);
        setSocket();
        navigation.navigate("Login");
    }

    return (
        <>
            {usernameModal && <Modal title={"更改用户名"} content={<><TextInput onChangeText={(text)=>setUsernameInput(text)} style={styles.input} />{usernameErr && <Text style={{margin:5,...styles.error_text}}>{usernameErr}</Text>}</>} interactions={<RippleButton onClick={handleUsernameChange} content={"确认"} />} close_func={()=>setUsernameModal(false)} />}
            <View style={chat.start}>
                <View style={chat.start_inner}>
                    <Image source={starticon} style={chat.start_icon}></Image>
                    <Text style={styles.large_text}>点击左上角图标选择群聊</Text>
                </View>
                <View style={{flexDirection:'row', marginBottom:20}}>
                    <Pressable onPress={launchNativeImageLibrary}><Image style={{width:80, height:80, borderRadius:50}} source={{"uri":`${server}/api/getpfp?${updater}`}}></Image></Pressable>
                    <View style={{marginLeft:10, justifyContent:'center'}}>
                        <Text style={styles.large_text}>{username}</Text>
                        <Pressable onPress={()=>{setUsernameModal(true)}} style={{borderColor:'white', borderBottomWidth:1, width:95}}><Text style={{color:'cyan',fontSize:18}}>更改用户名</Text></Pressable>
                    </View>
                </View>
                <Text style={styles.text}>{pictureErr}</Text>
                <Button title="退出账号" color={"#eb4034"} onPress={handleLogout}></Button>
            </View>
        </>
    )
}