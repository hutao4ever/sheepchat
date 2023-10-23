import { View, Image, Text, Animated, StyleSheet, FlatList, Pressable } from "react-native";
import { styles } from "../styles";
import banicon from "../assets/lock.png";
import unbanicon from "../assets/green-lock.png";
import { memo, useEffect, useState } from "react";

const mystyles = StyleSheet.create({
    container:{
        position:'absolute',
        top:0,
        height:'100%',
        left:0,
        right:0,
        backgroundColor:'#2c3632',
        padding:'5%',
        zIndex:2
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
        borderColor:'white'
    }
});

const handle_ban = (server, socket, channel, userid, username, index, setList, setBanList)=>{
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

const handle_unban = (server, channel, userid, username, index, setList, setBanList)=>{
    fetch(server+"/api/admin/unban", {method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({"channel_id": channel, "unban_target":userid})})
    .then(response=>response.json())
    .then(data=>{
        if(data.status=="success"){
            setBanList((list)=>{let l = list; l.splice(index,1); return l});
            setList((list)=>[...list, {"id":userid, "username":username}]);
        }
    });
}

const MemberItem = memo(({index, server, socket, myusername, channel, username, userid, ownership, setList, setBanList})=>{
    return (
        <View style={mystyles.item}>
            {console.log(index)}
            <Image source={{"uri":server+"/api/getpfp?userid="+userid+"&&"+new Date()}} style={{width:50,height:50,borderRadius:100}}></Image>
            <Text style={{...styles.text, marginLeft:15}}>{username}</Text>
            {/*ownership&&myusername!==username&&
            <Pressable style={mystyles.banbtn} onPress={()=>handle_ban(server, socket, channel, userid, username, index, setList, setBanList)}>
                <Image source={banicon} style={{width:20,height:20}}></Image>
                <Text style={{color:'#f03838', fontSize:18}}>封禁</Text>
            </Pressable>*/}
        </View>
    )
});

const BannedItem = memo(({index, server, channel, username, userid, ownership, setList, setBanList})=>{
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

export const MemberList = ({style, server, socket, username, channel, close_func})=>{
    const [list, setList] = useState([]);
    const [banlist, setBanList] = useState([]);
    const [tab, setTab] = useState("member");
    const [ownership, setOwnership] = useState(false);

    useEffect(()=>{
        fetch(`${server}/api/memberlist?channel=${channel}`).then((response)=>response.json()).then((data)=>{
            let memberlist = data[0];
            let banlist = data[1];
            for(let element of memberlist){
                if(element.isowner==true && element.username==username){
                    setOwnership(true);
                    break;
                }
            };
            
            setList(memberlist);
            setBanList(banlist);
        });
    },[channel])

    return (
        <Animated.View style={{...mystyles.container, ...style}}>
            <Pressable onPress={close_func}>
                <Text style={{...styles.text, margin:10}}>X</Text>
            </Pressable>
            <View style={mystyles.selection}>
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
        </Animated.View>
    )
}