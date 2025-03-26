import { server } from "../server_addr";
import {launchImageLibrary} from 'react-native-image-picker';
import { View, Image, Text, Pressable, Button } from "react-native"
import { chat } from "../stylesheets/chatstyles"
import { styles } from "../stylesheets/styles"
import { useState, useEffect } from "react";
import { Modal } from "./modal";
import { TextInput } from "react-native-gesture-handler";
import { RippleButton } from "./ripplebutton";
import { CachedImage } from "@georstat/react-native-image-cache";

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

const passwordRequirements = [
    {key:"长度不能小于八个字符"},
    {key:"有四个不同的字母"},
    {key:"含有数字"},
    {key:"有一个大写字母"}
];

const handlePasswordChange = (pwdRequires, passwordInput, oldPasswordInput, confirmPasswordInput, setPasswordErr, setPasswordChanged)=>{
    if(!arrayEquals(pwdRequires, [false, false, false, false])){
        setPasswordErr("请满足所有密码的条件！");
        return;
    }else{
        setPasswordErr("");
    }
    if(passwordInput !== confirmPasswordInput){
        setPasswordErr("密码不一致，请仔细核对。");
        return;
    }else{
        setPasswordErr("");
    }
    fetch(`${server}/api/changepwd`, {
        method:"POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"password_old": oldPasswordInput, "password_new":passwordInput})
    }).then((response)=>response.json()).then((data)=>{
        if(data["status"] == "success"){
            setPasswordChanged(true);
        }else if(data.status == "fail"){
          if(data.error == "mismatch"){
            setPasswordErr("当前密码错误。");
          }else{
            setPasswordErr("服务器错误:"+data.error)
          }
        }
    })
}

const handleUsernameChange = (usernameInput, setUsernameErr, setUsername, setUsernameModal)=>{
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

export const User = ({username, setUsername})=>{
    const [usernameModal, setUsernameModal] = useState(false);
    const [passwordModal, setPasswordModal] = useState(false);
    const [usernameErr, setUsernameErr] = useState();
    const [usernameInput, setUsernameInput] = useState();
    const [oldPasswordInput, setOldPasswordInput] = useState();
    const [passwordInput, setPasswordInput] = useState("");
    const [confirmPasswordInput, setConfirmPasswordInput] = useState();
    const [passwordErr, setPasswordErr] = useState();
    const [pwdRequires, setPwdRequires] = useState([]);
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [pictureErr, setPictureErr] = useState();
    const [updater, update] = useState(new Date());

    useEffect(()=>{
        setPwdRequires((array)=>[false, false, false, false]);
        if(passwordInput.length < 8){
            setPwdRequires((array)=>{array[0]=true; return array});
        }
        let str = passwordInput.replace(/[0-9]/g, '');
        str = str.split('');
        str = new Set(str);
        str = [...str].join("");
        if(str.length < 4){
            setPwdRequires((array)=>{array[1]=true; return array});
        }
        if(!/\d/.test(passwordInput)){
            setPwdRequires((array)=>{array[2]=true; return array});
        }
        if(!/[A-Z]/.test(passwordInput)){
            setPwdRequires((array)=>{array[3]=true; return array});
        }
    },[passwordInput])

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

            fetch(`${server}/api/changepfp`, {
                method: 'POST',
                body: formData,
                headers:{
                    'Content-Type':'multipart/form-data'
                }
            }).then((res)=>res.text()).then((res)=>{
                if(res == "No file uploaded."){
                    setPictureErr("头像上传失败，请确保文件小于2MB");
                    setTimeout(()=>{setPictureErr()}, 1000);
                }
                
                if(res == "ok"){
                    update(new Date());
                }
            }).catch((e)=>{
                if(e){
                    setPictureErr("网络错误，请重试。");
                    console.log(e);
                }
            });
          }
        });
      }

    return (
        <>
            {usernameModal && <Modal title={"更改用户名"} content={
                <>
                    <TextInput onChangeText={(text)=>setUsernameInput(text)} style={styles.input} placeholder="输入新用户名" />
                    {usernameErr && <Text style={{margin:5,...styles.error_text}}>{usernameErr}</Text>}
                </>
                } 
                interactions={
                    <RippleButton onClick={()=>handleUsernameChange(usernameInput, setUsernameErr, setUsername, setUsernameModal)} content={"确认"} textcolor={styles.text.color} />
                } 
                close_func={()=>setUsernameModal(false)} />}
            {passwordModal && <Modal title={"更改密码"} content={!passwordChanged?
                <>
                    <TextInput onChangeText={(text)=>setOldPasswordInput(text)} style={styles.input} placeholder="输入当前密码" />
                    <TextInput onChangeText={(text)=>setPasswordInput(text)} style={styles.input} placeholder="输入新密码" />
                    <TextInput onChangeText={(text)=>setConfirmPasswordInput(text)} style={styles.input} placeholder="确认新密码" />
                    {passwordErr && <Text style={{margin:5,...styles.error_text}}>{passwordErr}</Text>}
                    <Text style={styles.text_black}>密码必须满足以下条件:</Text>
                    {passwordRequirements.map((item, index)=><Text key={index} style={pwdRequires[index]?{textDecorationLine: 'line-through', textDecorationStyle: 'solid', ...styles.text_black}:styles.text_black}>{item.key}</Text>)}
                </>:<Text>密码修改成功!</Text>
                } 
                interactions={
                    <RippleButton onClick={()=>{if(passwordChanged){setPasswordModal(false);setPasswordChanged(false)}else{handlePasswordChange(pwdRequires, passwordInput, oldPasswordInput, confirmPasswordInput, setPasswordErr, setPasswordChanged)}}} content={"确认"} textcolor={styles.text.color} />
                } 
                close_func={()=>{setPasswordModal(false); setPasswordChanged(false)}} />}
            <View style={{marginLeft:20, marginTop:10}}>            
                <View style={{flexDirection:'row'}}>
                    <Pressable onPress={launchNativeImageLibrary}><CachedImage style={{width:80, height:80, borderRadius:50}} source={`${server}/api/getpfp?${updater}`} thumbnailSource=""></CachedImage></Pressable>
                    <View style={{justifyContent:'center'}}>
                        <Text style={styles.large_text}>{username}</Text>
                        <View style={{display:"flex", flexDirection:"row"}}>
                            <Pressable onPress={()=>{setUsernameModal(true)}} style={{marginTop:5, alignSelf:"flex-start"}}><Text style={{borderColor:'gray', borderWidth:2, borderRadius:4, padding:5, fontSize:17}}>更改用户名</Text></Pressable>
                            <Pressable onPress={()=>{setPasswordModal(true)}} style={{marginTop:5, marginLeft:5, alignSelf:"flex-start"}}><Text style={{borderColor:'gray', borderWidth:2, borderRadius:4, padding:5, fontSize:17}}>更改密码</Text></Pressable>
                        </View>
                    </View>
                </View>
                <Text style={styles.text}>{pictureErr}</Text>
            </View>
        </>
    )
}