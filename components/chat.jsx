import {React, useState, useEffect, useRef, useCallback } from "react";
import {Dimensions} from 'react-native';
import {ChannelMenu} from './channelmenu';
import {ChatHome} from "./chathomewidget";
import {MemberList} from "./memberlist";
import { View, Text, Image, Pressable, Animated, Keyboard } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Modal } from "./modal";
import { ChatSender } from "./chatsender";
import { chat } from "../chatstyles";//stylesheet
import list_icon from "../assets/logo.jpg";
import share_icon from "../assets/share.png";
import members_icon from "../assets/people.png";
import { styles } from "../styles";
import { MessageItem } from "./messageitem";
import { ChannelSharer } from "./channelsharer";

const addMessage = async (server, setData, channelCache, channel, msg, prepend, self)=>{
    let content = msg.content;

    let timestamp = new Date();
    timestamp.setTime(msg.timestamp);
    let todaysDate = new Date();
    var timestring = `${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2,'0')} ${timestamp.getMonth()+1}/${timestamp.getDate().toString().padStart(2,'0')}`;
    if(timestamp.toDateString() == todaysDate.toDateString()){
        timestring = `今天 ${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2,'0')}`;
    }

    if(self){
        msg.username = msg.sender.split("#")[0];
        timestring = `今天 ${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2,'0')}`;
    }else{
        const response = await fetch(`${server}/api/findusrname?userid=${msg.sender}`)
        let data = await response.text();
        msg.username = data.split("#")[0];
    }

    try{
        if(content.img){
            content.img.forEach((imgid, index)=>{
                let imgSrc = `${server}/api/getfile?channel=${channel}&id=${imgid}`;
                let cmsg = {"sender":msg.sender, "username":msg.username, "timestamp":timestring, "img":imgSrc, "key":msg.msgid+index};
                if(msg.channel == channel || self){//if the message(from socket) is for an unselected channel, do not load it
                    setData((data) => prepend?[cmsg, ...data]:[...data, cmsg]);
                }
                prepend? channelCache.current[channel]["data"].unshift(cmsg):channelCache.current[channel]["data"].push(cmsg);
            });
        }else if(typeof content === 'string' || content instanceof String){ //pure text message
            let cmsg = {"sender":msg.sender, "username":msg.username, "timestamp":timestring, "text":content, "key":msg.msgid};
            if(msg.channel == channel || self){
                setData((data) => prepend?[cmsg, ...data]:[...data, cmsg]); 
            }
            prepend? channelCache.current[channel]["data"].unshift(cmsg):channelCache.current[channel]["data"].push(cmsg);        
        }
    }catch(e){
        console.log(e);
    }
}

const addMessage_more = async (server, channel, setData, channelCache, listofmsg) => {
    let i = 0;
    let processed_ = [];
    let id2username = {};//cache username so we dont have to fetch it every time

    //create a cache for this channel if not exist
    if(!(channel in channelCache.current)){
        channelCache.current[channel] = {"data":[]};
    }

    while(i<listofmsg.length){
        try{
            var msg = JSON.parse(listofmsg[i]);
        }catch(e){
            //console.log(listofmsg[i]);
        }
        let content = msg.content;

        let timestamp = new Date();
        timestamp.setTime(msg.timestamp);
        let todaysDate = new Date();
        var timestring = `${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2,'0')} ${timestamp.getMonth()+1}/${timestamp.getDate().toString().padStart(2,'0')}`;
        if(timestamp.toDateString() == todaysDate.toDateString()){
            timestring = `今天 ${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2,'0')}`;
        }

        if(msg.sender in id2username){
            msg.username = id2username[msg.sender].split("#")[0];
        }else{
            const response = await fetch(`${server}/api/findusrname?userid=${msg.sender}`)
            let data = await response.text();
            id2username[msg.sender] = data;
            msg.username = data.split("#")[0];
        }

        try{
            if(content.img){
                content.img.forEach((imgid,index)=>{
                    let imgSrc = `${server}/api/getfile?channel=${channel}&id=${imgid}`;
                    processed_.push({"sender":msg.sender, "username":msg.username, "timestamp":timestring, "img":imgSrc, "key":msg.msgid+index});
                    channelCache.current[channel]["data"].push(processed_[processed_.length-1]);
                });
            }else if(typeof content === 'string' || content instanceof String){ //pure text message
                processed_.push({"sender":msg.sender, "username":msg.username, "timestamp":timestring, "text":content, "key":msg.msgid});
                channelCache.current[channel]["data"].push(processed_[processed_.length-1]);
            }
        }catch(e){
            //console.log(e);
        }
        i++;
    }
    setData((data)=>[...processed_, ...data]);
}

const SendHandler = (socket, server, channel, setData, channelCache, message, username)=>{
    if(message.fileIds){
        socket.emit('incoming', JSON.stringify([channel, {"img":message.fileIds}]), (response)=>{
            if(response.res === "ok"){
                addMessage(server, setData, channelCache, channel, {"sender":username, "timestamp":response.timestamp,"msgid":response.id, "content":{"img":message.fileIds}}, false, true);
            }
        });
    }else{
        if(message !== ""){
            socket.emit('incoming', JSON.stringify([channel, message]), (response)=>{
                if(response.res === "ok"){
                    //console.log("sent a message");
                    addMessage(server, setData, channelCache, channel, {"sender":username, "timestamp":response.timestamp, "msgid":response.id, "content":message}, false, true);
                }
            });
        }   
    }
}

export const Chatmessage = ({server, navigation, socket, username, setSocket, setUsername})=>{
    const [data, setData] = useState(); //store every message displayed
    const [more, setMore] = useState(true); //if there is more history message to load
    const [winHeight, setWinHeight] = useState(0);
    const [page, setPage] = useState(1); //how much history has loaded 
    const [userScrolled, setUserScrolled] = useState(); //is the user viewing history or want newest messages
    const [channel, setChannel] = useState(0);//select channel id
    var channelRef = useRef();
    channelRef.current=channel;
    const [scroll_to, setScroll_to] = useState();//to preserve user scroll position when user navigate to another channel and back
    const [selectedChannelName, SetSelectedChannelName] = useState();
    const [openShareModal, setOpenShareModal] = useState(false);
    const [openChannelMenu, SetOpenChannelMenu] = useState(false);
    const openChannelMenuRef = useRef();
    openChannelMenuRef.current = openChannelMenu;
    const [openMemberList, SetOpenMemberList] = useState(false);
    const [files, setFiles] = useState(); //files(uri, type, size, name) selected through image gallery
    var channelCache_ = useRef({});
    var messageContainer = useRef();

    const swapChannel = (channel_id, channel_name)=>{
        //console.log(channelCache_);
        toggle_channel_menu();//close channel menu
        if(channel_id==""){
            setChannel(false);
            SetSelectedChannelName(false);
            return;
        }
        
        //reset values
        setChannel(channel_id);
        SetSelectedChannelName(channel_name);
        setData([]);
        setPage(1);
        setMore(true);
        setUserScrolled(false);
        setWinHeight(0);
        //check if we cached the channel
        if(channel_id in channelCache_.current){
            //restore saved data
            //console.log("found cache");
            let saved = channelCache_.current[channel_id];
            setData(saved["data"]);
            //setMore(saved["more"]);
            //setPage(saved["page"]);
            //setUserScrolled(saved["userScrolled"]);
            //setScroll_to(saved["scrollPosition"]);
        }else{
            loader(channel_id);
        }
    }

    //initial execute
    useEffect(()=>{
        function onConnect() {
            //console.log("socket connected!");
        }

        function onDisconnect() {
            //console.log("socket disconnected!");
        }

        function onMessage(msg){
            handleSocketMessage(msg);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('message', onMessage);
        //socket.on('connect_error',(err)=>console.log(err));

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('message', onMessage);
        };
    },[socket]);

    const handleSocketMessage = (data)=>{
        msg = JSON.parse(data);
        addMessage(server, setData, channelCache_, channelRef.current, msg);
    }
    
    const loader = useCallback(async (channel_) => {
        const response = await fetch(`${server}/api/loadmessage?channel=${channel_?channel_:channel}&page=${channel_?1:page}`);
        var newData = await response.json();
        
        if(response.status=="fail"){
            setChannel(false);
            return false;
        }

        newData=newData.data;

        if(newData.slice(-1)[0] === "end"){
            setMore(false);
            newData.pop();
        }

        await addMessage_more(server, channel_?channel_:channel, setData, channelCache_, newData);

        if(!channel_){
            setPage((page) => page+1);
        }
    },[page]);

    const scrollToBottom = ()=>{
        if(messageContainer.current){
            messageContainer.current.scrollToEnd();
        }
    }

    useEffect(()=>{
        //always try to scroll to the bottom of page if the user is not looking at history
        scrollToBottom();
    });
    /*
    useEffect(()=>{
        //preserve user scroll position when history messages are prepended to the top
        if(channel){
            let newWinheight = messageContainer.current.scrollHeight;
            messageContainer.current.scrollTo(0, newWinheight-winHeight);
        }
    },[isLoading, winHeight])*/
    useEffect(()=>{
        Keyboard.addListener('keyboardDidShow', scrollToBottom);
        return ()=>{Keyboard.removeAllListeners('keyboardDidShow')}
    })


    useEffect(()=>{
        if(channel && userScrolled){
            messageContainer.current.scrollToOffset({offset:scroll_to});
        }
    },[scroll_to])

    const channelmenu_slide = useRef(new Animated.Value(-Dimensions.get("window").width)).current;
    const toggle_channel_menu = ()=>{
        let openChannelMenu = openChannelMenuRef.current;
        if(!openChannelMenu){
            Animated.timing(channelmenu_slide, {
                useNativeDriver:true,
                toValue:0,
                duration:300
            }).start();
            SetOpenChannelMenu(true);
        }else{
            Animated.timing(channelmenu_slide, {
                useNativeDriver:true,
                toValue:-Dimensions.get("window").width,
                duration:300
            }).start();
            SetOpenChannelMenu(false);
        }
    }

    const memberlist_slide = useRef(new Animated.Value(-Dimensions.get("window").height)).current;
    const toggle_members_list = ()=>{
        if(!openMemberList){
            Animated.timing(memberlist_slide, {
                useNativeDriver:true,
                toValue:0,
                duration:300
            }).start();
            SetOpenMemberList(true);
        }else{
            Animated.timing(memberlist_slide, {
                useNativeDriver:true,
                toValue:-Dimensions.get("window").height,
                duration:300
            }).start();
            SetOpenMemberList(false);
        }
    }

    return(
        <>
            {
                openShareModal && <Modal title={"群聊ID"} close_func={()=>{setOpenShareModal(false)}} content={
                <ChannelSharer server={server} channel={channel}/>} />
            }
            
            <View style={chat.top_menu}>
                <View style={{flex:1, flexDirection:'row'}}>
                    <View style={{flex:1}}>
                        <Pressable onPress={toggle_channel_menu}>
                            <Image source={list_icon} style={chat.menu_icon}></Image>
                        </Pressable>
                    </View>
                    <View style={{flex:2, alignItems:'center'}}>
                        <Text style={styles.large_text}>{selectedChannelName}</Text>
                    </View>
                    <View style={{flex:1, flexDirection:'row'}}>
                        {selectedChannelName&&
                            <>
                                <Pressable onPress={()=>{setOpenShareModal(true)}}>
                                    <Image source={share_icon} style={chat.menu_icon}></Image>
                                </Pressable>
                                <Pressable onPress={toggle_members_list}>
                                    <Image source={members_icon} style={chat.menu_icon}></Image>
                                </Pressable>
                            </>
                        }
                    </View>
                </View>
            </View>

            <ChannelMenu server={server} setSocket={setSocket} navigation={navigation} style={{transform:[{translateX:channelmenu_slide}]}} swapChannel={(channel_id, channel_name)=>{swapChannel(channel_id, channel_name)}} channel={channel} />
            
            {channel?//display startup screen or chat screen based on whether user selected channel
            <>
                <MemberList style={{transform:[{translateY:memberlist_slide}]}} channel={channel} username={username} server={server} socket={socket} close_func={toggle_members_list}/>
                {more? null : <Text style={{...styles.header,margin:15}}>欢迎使用羊论。</Text>} 
                    
                <FlatList
                    data={data}
                    renderItem={({item})=><MessageItem server={server} item={item} />}
                    ref={messageContainer}
                    onContentSizeChange={()=>{scrollToBottom()}}
                    onLayout={()=>{scrollToBottom()}}
                />
                

                <ChatSender server={server} SendHandler={(message)=>{SendHandler(socket, server, channel, setData, channelCache_, message, username)}} setFiles={setFiles} files={files} channel={channel} />
            </>
            :
            <ChatHome server={server} username={username} setUsername={setUsername} setSocket={setSocket} navigation={navigation} />
            }
        </>
    )
}