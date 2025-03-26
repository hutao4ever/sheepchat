import { server } from "../server_addr";
import { useEffect, useState, memo, useContext } from "react";
import { Modal } from "./modal";
import { View, Image, Text, Animated, StyleSheet, FlatList, Pressable, TextInput } from "react-native";
import { RippleButton } from "./ripplebutton";
import {Dimensions} from 'react-native';
import add_icon from "../assets/plus-black.png";
import link_icon from "../assets/link.png";
import create_icon from "../assets/asterisk.png";
import home_icon from "../assets/home.png";
import placeholder from "../assets/starticon.png";
import { styles } from "../stylesheets/styles";
import { LoadIndicator } from "./loadindicator";
import { channelContext } from "../contexts";
import { User } from "./user";
import { CachedImage } from "@georstat/react-native-image-cache";
const _ = require('lodash');

const menu_styles = StyleSheet.create({
    channel_menu:{
        position:'absolute',
        width:Dimensions.get('window').width,
        height:Dimensions.get('window').height,
        backgroundColor:styles.app.backgroundColor,
        top:45,
        zIndex:2
    },
    container:{
        flex:1,
        justifyContent:'center'
    },
    card:{
        width:'40%',
        height:150,
        margin:'5%',
        borderWidth:2,
        borderColor:'#1B1725',
        borderRadius:5,
        padding:10,
        alignItems:'center'
    },
    card_inner:{
        width:'100%',
        height:'90%',
    },
    card_text:{
        position:'absolute',
        bottom:0,
        width:'100%',
        height:35,
        justifyContent:'center',
        alignItems:'center'
    },
    card_button:{
        width:80,
        height:80,
        borderRadius:10,
        margin:5,
        justifyContent:'center',
        alignItems:'center'
    },
    card_button_img:{
        width:55,
        height:55
    }
})

const ChannelThumbnail = memo(({id, name, setOpenChannelModal, swapChannel})=>{
    const placeholder_uri = Image.resolveAssetSource(placeholder).uri;
    return (
    !id?
    <Pressable style={{...menu_styles.card,justifyContent:'center',alignItems:'center'}} onPress={()=>{setOpenChannelModal(true)}}>
        <Image style={{width:50, height:50, marginBottom:10}} source={add_icon} />
        <Text style={styles.text}>创建/加入群聊</Text>
    </Pressable>
    :
    <Pressable style={menu_styles.card} onPress={()=>{swapChannel(id, name);}}>
            <CachedImage style={{width:100, height:100, borderRadius:50, overflow:"hidden"}} thumbnailSource={placeholder_uri} source={`${server}/api/geticon?channel_id=${id}&updater=${new Date()}`} blurRadius={0} resizeMode="contain"/>
        
            <View style={menu_styles.card_text}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.text}>{name}</Text>
            </View>  
        
    </Pressable>
    )
}, (a,b)=>a.name==b.name);

export const ChannelMenu = ({navigation, style, swapChannel, username, setUsername, socket}) => {
    const channels = useContext(channelContext).channels;
    const setChannels = useContext(channelContext).setChannels;

    const [openChannelModal, setOpenChannelModal] = useState(false);
    const [modalstatus, setModalStatus] = useState("");
    const [createErr, setCreateErr] = useState(null);
    const [joinErr, setJoinErr] = useState(null);
    const [createName, setCreateName] = useState();
    const [joinId, setJoinId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(()=>{
        setChannels([]);
        fetch(`${server}/api/getchannels`).then(response=>{if(response.status !== 401){return response.json()}else{navigation.navigate('Login');return [];}}).then((data)=>{
            data.forEach(element => {
                setChannels((channels)=>[...channels, {...element, key:channels.length+1}]);
            })
        }).catch((e)=>{
            console.log(e);
        });
    },[]);

    const create_channel = () => {
        let name = createName;
        if(name.length == 0){
            setCreateErr("群名不能为空");
            return;
        }
        setIsLoading(true);   
        const request_parameters = {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"name": name})
        };
        fetch(`${server}/api/createchannel`, request_parameters).then(response=>response.json()).then(data=>{
            if(data["status"]==="success"){
                setChannels((channels)=>[{"channel_id":data["channel_id"], "channel_name":name},...channels]);
                setCreateErr(null);
                setCreateName("");
                setOpenChannelModal(false);
                //reload access list on socket server
                socket.emit('reload');
            }else if(data["status"]==="fail"){
                setCreateErr("Server error:"+data["err"]);
            }
            setIsLoading(false);
        }).catch((e)=>{
            setIsLoading(false);
            setCreateErr("网络请求失败，请重试");
            console.log(e);
        });
    }

    const join_channel = ()=>{
        if(joinId.length < 1){
            setJoinErr("不能为空!");
            return;
        }

        const request_parameters = {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"join_code": joinId})
        };
        fetch(`${server}/api/joinchannel`, request_parameters).then(response=>response.json()).then(data=>{
            if(data.status==="success"){
                setChannels((channels)=>[{"channel_id":data.id, "channel_name":data.name},...channels]);
                setJoinErr(null);
                setJoinId("");
                setOpenChannelModal(false);
                //reload access list on socket server
                socket.emit('reload');
            }else if(data.status==="fail"){
                if(data.err=="invalid code"){
                    setJoinErr("无效id, 请检查输入是否正确。");
                }else if(data.err=="banned"){
                    setJoinErr("您已被此群聊封禁。");
                }else if(data.err=="duplicate"){
                    setJoinErr("您已加入此群聊。");
                }else{
                    setJoinErr("错误:"+data.err);
                }
            }
        }).catch((e)=>{
            setCreateErr("网络请求失败，请重试");
            console.log(e);
        });
    }

    return (
        <>
        {
            openChannelModal? <Modal title={""} close_func={()=>{setOpenChannelModal(false); setModalStatus("");}} content={
            <>
            {modalstatus == "" &&
            <View style={{flexDirection:'row'}}>
                <Pressable style={{...menu_styles.card_button, backgroundColor:'#4de890'}} onPress={()=>{setModalStatus("join")}}>
                    <Image source={link_icon} style={menu_styles.card_button_img}></Image>
                    <Text>加入群聊</Text>
                </Pressable>
                <Pressable style={{...menu_styles.card_button, backgroundColor:'#4daae8'}} onPress={()=>{setModalStatus("create")}}>
                    <Image source={create_icon} style={menu_styles.card_button_img}></Image>
                    <Text>创建群聊</Text>
                </Pressable>
            </View>}
            {modalstatus=="create" && 
                <>
                {isLoading?<LoadIndicator />:
                <View>
                    <TextInput style={{...styles.input}} onChangeText={(text)=>{setCreateName(text)}} placeholder="输入一个群聊名称" placeholderTextColor={styles.text.color} maxLength={25} />
                    {createErr && <Text style={{margin:5,...styles.error_text}}>{createErr}</Text>}    
                    <RippleButton content={"确认"} onClick={create_channel} textcolor={styles.text.color}/>
                </View>}
                </>
            }
            {modalstatus=="join" && 
            <View>
                <TextInput style={styles.input} onChangeText={(text)=>{setJoinId(text)}} placeholder="输入/粘贴群聊id" placeholderTextColor={styles.text.color} maxLength={36}/>
                {joinErr && <Text style={{...styles.error_text}}>{joinErr}</Text>}    
                <RippleButton content={"确认"} onClick={join_channel} textcolor={styles.text.color} />
            </View>}
            </>
            } />:null
        }
        
        <Animated.View style={{...menu_styles.channel_menu,...style}}>
            <User username={username} setUsername={setUsername}></User>
            <View style={menu_styles.container}>
                <FlatList
                    data={[{key:0},...channels]}
                    renderItem={({item})=><ChannelThumbnail id={item.channel_id} name={item.channel_name} setOpenChannelModal={setOpenChannelModal} swapChannel={swapChannel} />}
                    numColumns={2}
                />
            </View>
        </Animated.View>
        </>
    )
}