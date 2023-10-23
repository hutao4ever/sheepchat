import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.jpg";
import { View, TextInput, Text, StyleSheet, Animated, Image, Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { RippleButton } from "./ripplebutton";
import { styles } from "../styles";

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

const mystyles = StyleSheet.create({
  registerContainer:{
    position:'absolute',
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    zIndex:1,
    backgroundColor: '#1b211f'
  },
  
  register:{
    borderRadius: 3,
    backgroundColor: 'var(--secondary-background-color)',
    overflowY: 'scroll',
    overflowX: 'hidden',
    width:'100%',
    height:'100%'
  },
  
  register_form:{
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    width:340,
    height:600
  },
  
  register_h2:{
    margin: 0
  },
  
  register_label:{
    marginTop: 30
  },
  
  register_img:{
    resizeMode:'contain',
    width: 70,
    height: 70
  },
  
  register_error:{
    margin: 2
  },
  
  register_ul:{
    marginBlock: 5
  },
  
  registerEnd:{
    position: 'absolute'
  },
  
  registerStart:{
    position: 'absolute',
  },

  title_text:{
    position:'relative',
    top:-20,
    height:100,
    fontSize:25
  },

  spacer:{
    height:300
  },

  input:{
    width:'85%'
  },

  button:{
    width:'90%'
  },

  error_text:{
    color: '#eb6134'
  }
});

export const Register = ({navigation, server}) => {
    const [password, setPassword] = useState("");
    const [pwdRequires, setPwdRequires] = useState([]);
    const [username, setUsername] = useState("");
    const [usernameErr, setUsernameErr] = useState("");
    const [email, setEmail] = useState("");
    const [emailErr, setEmailErr] = useState("");
    const [passwordErr, setPasswordErr] = useState("");
    const [confirmpassword, setConfirmPassword] = useState("");
    const [confPasswordErr, setConfPasswordErr] = useState("");
    const [usrname, setUsrname] = useState(""); //responded username data

    const form_animation_value = useRef(new Animated.Value(400)).current;
    const form_animation = useRef(Animated.timing(form_animation_value, {
        toValue:10,
        useNativeDriver:true,
        duration:300
    })).current;
    const passwordRequirements = useRef([
        {key:"长度不能小于八个字符"},
        {key:"有四个不同的字母"},
        {key:"含有数字"},
        {key:"有一个大写字母"}
    ]).current;

    var scroll_view = useRef();
    var page_top = useRef();
    //save y coords of these two input fields to be scrolled into view or they get covered by keyboard
    var confirm_pwd_layout = useRef();
    var pwd_layout = useRef();

    const handleSubmit = (username, email, password, pwdRequires, confirmpassword)=>{
        username = username.trim();

        if(username.length < 2 || username.length > 25){
            setUsernameErr("用户名的长度不能超过25个字符也不能短于2个字符!");
            return;
        }else if(username.includes("#")){
            setUsernameErr("用户名不能含有井号‘#’！");
            return;
        }
        else{
            setUsernameErr("");
        }
        
        if(!email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
            setEmailErr("邮箱格式不正确!");
            return;
        }else{
            setEmailErr("");
        }
        
        if(!arrayEquals(pwdRequires, [false, false, false, false])){
            setPasswordErr("请满足所有密码的条件！");
            return;
        }else{
            setPasswordErr("");
        }
        if(password !== confirmpassword){
            setConfPasswordErr("和密码不一致，请仔细核对。");
            return;
        }else{
            setConfPasswordErr("");
        }

        fetch(`${server}/api/register`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"username": username, "email": email, "password":password})
        }).then((response)=>response.json()).then((data)=>{
            if(data["status"] == "success"){
                setUsrname(data["username"]);
                form_animation.start();
            }else if(data.status == "fail"){
              if(data.error == "used email"){
                setEmailErr("此邮箱地址已被注册。");
              }
            }
        })
    }

    useEffect(()=>{
        setPwdRequires((array)=>[false, false, false, false]);
        if(password.length < 8){
            setPwdRequires((array)=>{array[0]=true; return array});
        }
        let str = password.replace(/[0-9]/g, '');
        str = str.split('');
        str = new Set(str);
        str = [...str].join("");
        if(str.length < 4){
            setPwdRequires((array)=>{array[1]=true; return array});
        }
        if(!/\d/.test(password)){
            setPwdRequires((array)=>{array[2]=true; return array});
        }
        if(!/[A-Z]/.test(password)){
            setPwdRequires((array)=>{array[3]=true; return array});
        }
    },[password])

    return (
        <View style={mystyles.registerContainer}>
            <View style={mystyles.register}>
                <Animated.View style={{...mystyles.registerStart, transform:[{translateX:form_animation_value.interpolate({
                    inputRange: [10, 400],
                    outputRange: [-310, 20]
                  })}]
                }}>
                    <Text style={{...styles.text, ...mystyles.title_text}}><Image source={logo} style={mystyles.register_img}></Image>羊论</Text>
                    <ScrollView ref={scroll_view} style={mystyles.register_form}>
                      <View onLayout={(e)=>page_top.current=e.nativeEvent.layout}></View>
                      <Text style={{...styles.text, ...mystyles.register_label}}>创建用户名</Text>
                      <TextInput id="username" style={{...styles.input, ...mystyles.input}} onChangeText={(text)=>{setUsername(text)}}></TextInput>
                      <Text style={styles.error_text}>{usernameErr}</Text>
                      
                      <Text style={{...styles.text, ...mystyles.register_label}}>电子邮箱</Text>
                      <TextInput id="email" style={{...styles.input, ...mystyles.input}} onChangeText={(text)=>{setEmail(text)}}></TextInput>
                      <Text style={styles.error_text}>{emailErr}</Text>
                      
                      <View onLayout={(e)=>pwd_layout.current=e.nativeEvent.layout}></View>
                      <Text style={{...styles.text, ...mystyles.register_label}}>设置密码</Text>
                      <TextInput id="password" style={{...styles.input, ...mystyles.input}} onChangeText={(text)=>{setPassword(text)}} onFocus={()=>{scroll_view.current.scrollTo({y:pwd_layout.current.y, animated:true})}}></TextInput>
                      <Text style={styles.text}>密码必须满足以下条件:</Text>
                      {passwordRequirements.map((item, index)=><Text key={index} style={pwdRequires[index]?{textDecorationLine: 'line-through', textDecorationStyle: 'solid', ...styles.text}:styles.text}>{item.key}</Text>)}
                      <Text style={styles.error_text}>{passwordErr}</Text>
                      
                      <Text style={{...styles.text, ...mystyles.register_label}}>确认密码</Text>
                      <TextInput id="confpassword" style={{...styles.input, ...mystyles.input}} onFocus={()=>{scroll_view.current.scrollTo({y:confirm_pwd_layout.current.y, animated:true})}} onChangeText={(text)=>{setConfirmPassword(text)}}></TextInput>
                      <Text style={styles.error_text}>{confPasswordErr}</Text>

                      <RippleButton onClick={()=>{handleSubmit(username,email,password,pwdRequires,confirmpassword)}} style={mystyles.button} content={"Register"}></RippleButton>
                      <View onLayout={(e)=>confirm_pwd_layout.current=e.nativeEvent.layout} style={mystyles.spacer}></View>
                    </ScrollView>
                </Animated.View>
                
                <Animated.View style={{...mystyles.registerEnd,transform:[{translateX: form_animation_value}]}}>
                    <Text style={styles.header}>注册完成!</Text>
                    <View style={{marginTop:40}}>
                      <Text style={{...styles.text, fontSize:20}}>这是你的用户名: </Text>
                      <Text style={{backgroundColor:"#34a1eb",color:"black",fontSize:25,marginVertical:5}} selectable={true} selectionColor="orange">  {usrname}  </Text>
                      <Text style={{...styles.text, fontSize:20}}>可以使用此用户名或电子邮箱<Text onPress={()=>{navigation.navigate("Login")}} style={{textDecorationLine:"underline",textDecorationColor:"#ffffff"}}>登录</Text>。</Text>
                    </View>
                </Animated.View>
            </View>
        </View>
    )
}