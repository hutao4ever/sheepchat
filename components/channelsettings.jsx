import { server } from "../server_addr";
import { View, Image, Text, Animated, StyleSheet, FlatList, Pressable, Button, Dimensions } from "react-native";
import { styles } from "../stylesheets/styles";
import editicon from "../assets/pen.png"
import banicon from "../assets/lock.png";
import {launchImageLibrary} from 'react-native-image-picker';
import unbanicon from "../assets/green-lock.png";
import { forwardRef, memo, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { RippleButton } from "./ripplebutton";
import { channelContext } from "../contexts";
import { Modal } from "./modal";
import { CachedImage } from '@georstat/react-native-image-cache';

const handle_ban = (socket, channel, userid, username, index, setList, setBanList)=>{
    fetch(server+"/api/admin/ban", {method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({"channel_id": channel, "ban_target":userid})})
    .then(response=>response.json())
    .then(data=>{
        if(data.status=="success"){
            setList((list)=>{let l = list; l.splice(index,1); return l});
            setBanList((list)=>[...list, {"id":userid, "username":username}]);
        }
    });
    socket.emit('admaction', JSON.stringify([channel, {"action":"ban", "target":userid}]));
}

const handle_unban = (channel, userid, username, index, setList, setBanList)=>{
    fetch(server+"/api/admin/unban", {method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({"channel_id": channel, "unban_target":userid})})
    .then(response=>response.json())
    .then(data=>{
        if(data.status=="success"){
            setBanList((list)=>{let l = list; l.splice(index,1); return l});
            setList((list)=>[...list, {"id":userid, "username":username}]);
        }
    });
}

const handle_change_channelname = (channel, name, setErr, setChannels, setSelectedChannelName)=>{
    setErr(false);
    if(name.length > 30){
        setErr("群聊名不能长于30个字符");
        return;
    }
    fetch(`${server}/api/admin/changename`, {method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({"channel_id": channel, "name":name})})
    .catch((e)=>{
        setErr("请求错误。请重试");
    })
    .then(response=>response.json())
    .then(data=>{
        if(data.status == "success"){
            setErr(false);
            setChannels((channels)=>channels.map((item)=>{if(item.channel_id==channel){item.channel_name=name} return item}));
            setSelectedChannelName(name);
        }else{
            setErr("server err");
        }
    })
}

const handle_change_channelpic = (channel, setErr, update)=>{
    let options = {
        mediaType:'photo'
    };
    setErr(false);
    launchImageLibrary(options, (response) => {
        if (!response.didCancel && !response.errorCode){
            const formData = new FormData();
            const file = response.assets[0];

            formData.append('channel_id', channel);

            formData.append('image',{
                uri:file.uri,
                type:file.type,
                name:file.fileName
            });
            
            fetch(server+"/api/admin/changeicon", {
                method: 'POST',
                body: formData,
                headers:{
                    'Content-Type':'multipart/form-data'
                }
            })
            .catch((e)=>{
                setErr("请求错误。请重试");
            })
            .then((response)=>response.json())
            .then((data)=>{
                if(data.status == "success"){
                    setErr(false);
                    update(new Date());
                }else{
                    setErr("server err");
                }
            })
        }
    });
}

const handle_delete_channel = (channel, setChannels, swapChannel) => {//TODO: use socket instead of api
    console.log(channel);
    fetch(`${server}/api/admin/delete`, {method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({"channel_id": channel})})
    .then((response)=>response.json())
    .then((data)=>{
        if(data.status == "success"){
            swapChannel("");
            setChannels((channels)=>channels.filter((item)=>{return item.channel_id!==channel}));
        }
    });
}

const MemberItem = memo(({index, socket, myusername, channel, username, userid, ownership, setList, setBanList})=>{
    return (
        <View style={mystyles.item}>
            <CachedImage maxAge={10} source={`${server}/api/getpfp?userid=${userid}`} thumbnailSource="" style={{width:50,height:50,borderRadius:100}}></CachedImage>
            <Text style={{...styles.text, marginLeft:15}}>{username}</Text>
            {/*ownership&&myusername!==username&&
            <Pressable style={mystyles.banbtn} onPress={()=>handle_ban(server, socket, channel, userid, username, index, setList, setBanList)}>
                <Image source={banicon} style={{width:20,height:20}}></Image>
                <Text style={{color:'#f03838', fontSize:18}}>封禁</Text>
            </Pressable>*/}
        </View>
    )
});

const BannedItem = memo(({index, channel, username, userid, ownership, setList, setBanList})=>{
    return (
        <View style={mystyles.item}>
            <Image source={{"uri":server+"/api/getpfp?userid="+userid}} style={{width:50,height:50,borderRadius:100}}></Image>
            <Text style={{...styles.text, marginLeft:15}}>{username}</Text>
            {ownership&&
            <Pressable style={mystyles.banbtn} onPress={()=>handle_unban(socket, channel, userid, username, index, setList, setBanList)}>
                <Image source={unbanicon} style={{width:20,height:20}}></Image>
                <Text style={{color:'#25f586', fontSize:18}}>解封</Text>
            </Pressable>}
        </View>
    )
})

export const ChannelSettings = ({style, socket, username, channel, close_func, ownership, setOwnership, setSelectedChannelName})=>{
    const [tab, setTab] = useState("member");
    const [list, setList] = useState([]);
    const [banlist, setBanList] = useState([]);
    const [openDeleteModal, SetOpenDeleteModal] = useState(false);
    const swapChannel = useContext(channelContext).swapChannel;
    const setChannels = useContext(channelContext).setChannels;

    const settings_ref = useRef();

    useEffect(()=>{
        fetch(`${server}/api/memberlist?channel=${channel}`).then((response)=>response.json()).then((data)=>{
            let memberlist = data[0];
            let banlist = data[1];
            for(let element of memberlist){
                if(element.isowner==true && element.username==username){
                    setOwnership(true);
                    setTab("settings");
                    break;
                }
            };
            
            setList(memberlist);
            setBanList(banlist);
        }).catch((err)=>{
            console.log(err);
        });
    },[channel]);
    
    return (
        <Animated.View style={{...mystyles.container, ...style}}>
            {openDeleteModal && <Modal title={"删除群聊"} close_func={()=>SetOpenDeleteModal(false)} content={<Text style={styles.text}>所有群聊数据将无法找回，确认删除?</Text>} interactions={
            <View style={{"width":"100%", "flexDirection":"row"}}>
                <RippleButton style={{"width":"40%", "marginHorizontal":5}} content={"取消"} onClick={()=>SetOpenDeleteModal(false)} />
                <RippleButton style={{"width":"40%", "borderColor":"red"}} textcolor={"red"} content={"确认"} onClick={()=>{handle_delete_channel(channel, setChannels, swapChannel);SetOpenDeleteModal(false);}}/>
            </View>} />}
            <Pressable onPress={()=>{close_func(); if(ownership && settings_ref.current){settings_ref.current.reset_values()}}}>
                <Text style={{...styles.text, margin:10}}>X</Text>
            </Pressable>
            <View style={mystyles.selection}>
                {ownership && <Pressable onPress={()=>{setTab("settings")}}>
                    <Text style={tab=="settings"?{...mystyles.selection_button, borderBottomWidth:3}: mystyles.selection_button}>设置</Text>
                </Pressable>}
                <Pressable onPress={()=>{setTab("member")}}>
                    <Text style={tab=="member"?{...mystyles.selection_button, borderBottomWidth:3}: mystyles.selection_button}>成员</Text>
                </Pressable>
                <Pressable onPress={()=>{setTab("ban")}}>
                    <Text style={tab=="ban"?{...mystyles.selection_button, borderBottomWidth:3}:mystyles.selection_button}>黑名单</Text>
                </Pressable>
            </View>
            {tab=="member"&&
            <FlatList
                data={list}
                renderItem={({item, index})=><MemberItem index={index} server={server} socket={socket} channel={channel} userid={item.id} myusername={username} username={item.username} ownership={ownership} setList={setList} setBanList={setBanList} />}
            />}
            {tab=="ban"&&
            <FlatList 
                data={banlist}
                renderItem={({item})=><BannedItem index={index} server={server} channel={channel} userid={item.id} username={item.username} ownership={ownership} setList={setList} setBanList={setBanList} />}
            />
            }
            
            {tab=="settings"&&
                <Settings_menu server={server} channel={channel} setSelectedChannelName={setSelectedChannelName} SetOpenDeleteModal={SetOpenDeleteModal} ref={settings_ref}/>
            }
        </Animated.View>
    )
}

const Settings_menu = forwardRef(({channel, setSelectedChannelName, SetOpenDeleteModal}, ref)=>{
    const channels = useContext(channelContext).channels;
    const setChannels = useContext(channelContext).setChannels;

    var channelname = "";
    const current_channelobj = channels.filter((item)=>{return item.channel_id==channel})[0]
    if(current_channelobj){
        channelname = current_channelobj.channel_name;
    }

    const [updater, update] = useState(0);
    const [nameChange, setNameChange] = useState(channelname);
    const [nameErr, setNameErr] = useState(false);
    const [iconErr, setIconErr] = useState(false);

    useImperativeHandle(ref, ()=>{
        return {
            reset_values(){
                setNameChange(channelname);
                setNameErr("");
            }
        }
    });
    
    return (
        <View>
            <View style={mystyles.setting_container}>
                <Text style={{...styles.text, ...mystyles.subtitle}}>群聊名称</Text>
                <TextInput style={styles.input} onChangeText={(text)=>{setNameChange(text)}} value={nameChange} placeholderTextColor={"white"} />
                <RippleButton content={"更改"} onClick={()=>{handle_change_channelname(channel, nameChange, setNameErr, setChannels, setSelectedChannelName)}} style={nameChange!=channelname && nameChange!=""?{width:100, borderColor:'#4de890'}:{width:100, borderColor:'gray'}} disabled={nameChange!=channelname && nameChange!=""?false:true} textcolor={nameChange!=channelname && nameChange!=""?'#4de890':'gray'}/>
                {nameErr&&<Text style={styles.text}>⚠️{nameErr}</Text>}
            </View>

            <View style={mystyles.setting_container}>
                <Text style={{...styles.text, ...mystyles.subtitle}}>群聊头像</Text>
                <Pressable style={mystyles.imageselector_container}  onPress={()=>{handle_change_channelpic(channel, setIconErr, update)}}>
                    <View style={mystyles.edit}>
                        <Image style={mystyles.edit_icon} source={editicon}></Image>
                    </View>
                    <Image style={mystyles.imageselector} source={{uri: `${server}/api/geticon?channel_id=${channel}&updater=${updater}`}}></Image>
                </Pressable>
                {iconErr&&<Text style={styles.text}>⚠️{iconErr}</Text>}
            </View>

            <View style={mystyles.setting_container}>
                <Text style={{...styles.text, ...mystyles.subtitle}}>删除群聊</Text>
                <Button color="red" title="删除群聊" onPress={()=>SetOpenDeleteModal(true)} />
            </View>
        </View>
    )
})

const mystyles = StyleSheet.create({
    container:{
        position:'absolute',
        top:0,
        height:Dimensions.get('window').height,
        left:0,
        right:0,
        backgroundColor:styles.app.backgroundColor,
        padding:'5%',
        zIndex:5
    },
    item:{
        flexDirection:'row',
        alignItems:'center',
        marginVertical:5
    },
    banbtn:{
        flexDirection:'row',
        alignItems:'center', 
        position:'absolute', 
        right:10
    },
    selection:{
        flexDirection:'row'
    },
    selection_button:{
        ...styles.text,
        margin:10,
        padding:10,
        borderBottomWidth:1,
        borderColor:'lightblue'
    },
    setting_container:{
        marginRight:10,
    },
    subtitle:{
        fontSize:30,
        marginVertical:10
    },
    imageselector_container:{
        width:120,
        height:120,
        borderColor:'white',
        borderWidth:2,
        borderStyle:'dashed',
        borderRadius:1
    },
    edit:{
        position:'absolute',
        backgroundColor:'#3b8ec6',
        height:35,
        right:-15,
        top:-10,
        borderRadius:10,
        zIndex:1
    },
    edit_icon:{
        width:25, 
        height:25,
        margin:5
    },
    imageselector:{
        position:'absolute',
        width:'100%',
        height:undefined,
        aspectRatio:1
    }
});