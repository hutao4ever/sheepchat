import { server } from "../server_addr";
import {React, useState, useEffect, useRef, useCallback} from "react";
import {Dimensions} from 'react-native';
import notifee from '@notifee/react-native';
import {ChannelMenu} from './channelmenu';
import {ChatHome} from "./chathomewidget";
import {ChannelSettings} from "./channelsettings";
import { View, Text, Image, Pressable, Animated, Keyboard } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Modal } from "./modal";
import { ChatSender } from "./chatsender";
import { chat } from "../stylesheets/chatstyles";//stylesheet
import sheepchat_icon from "../assets/logo.jpg";
import share_icon from "../assets/share.png";
import members_icon from "../assets/people.png";
import settings_icon from "../assets/gear.png";
import logout_icon from "../assets/logout.png";
import { styles } from "../stylesheets/styles";
import { MessageItem } from "./messageitem";
import { ChannelSharer } from "./channelsharer";
import { LargeImageView } from "./largeimageview";
import { channelContext } from "../contexts";
import { MessageItemOperations } from "./messageitemop";
import { MoveToEndButton } from "./movetoend";

const notifyMessage = async (channel_name, user, content) => {
    await notifee.requestPermission();
    const notifychannel = await notifee.createChannel({
        id: 'notify',
        name: 'Message Notifier Channel',
    });
    console.log(user);
    await notifee.displayNotification({
        title: `New message in ${channel_name}`,
        body: user+': '+(content.img?'[Image]':content),
        android: {
          channelId:notifychannel,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'notify',
          },
        },
    });
}

const addMessage = async (setData, channelCache, channel, msg, prepend, self, channels)=>{
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
        //timestring = `今天 ${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2,'0')}`;
    }else{
        const response = await fetch(`${server}/api/getusername?userid=${msg.sender}`);
        let data = await response.text();
        console.log(data);
        msg.username = data.split("#")[0];
    }

    try{
        if(content.img){
            var cmsg = {"sender":msg.sender, "username":msg.username, "timestamp":timestring, "img":content.img, "channel":channel, "key":msg.ID};
        }else if(typeof content === 'string' || content instanceof String){ //pure text message
            var cmsg = {"sender":msg.sender, "username":msg.username, "timestamp":timestring, "text":content, "key":msg.ID};        
        }
        if(msg.channel == channel || self){
            setData((data) => prepend?[...data, cmsg]:[cmsg, ...data]); 
        }else{//send a notification to the user if a message is recieved in another channel
            let channelname = channels.filter((item)=>{return item.channel_id==channel})[0].channel_name
            notifyMessage(channelname,msg.username,content);
        }
        prepend? channelCache.current[channel]["data"].push(cmsg):channelCache.current[channel]["data"].unshift(cmsg);
    }catch(e){
        console.log("erre");
        console.log(e);
    }
}

const addMessage_more = async (channel, setData, channelCache, listofmsg) => {
    let i = 0;
    let processed_ = [];
    let id2username = {};//cache username so we dont have to fetch it every time

    if(!channelCache.current[channel].hasOwnProperty("data")){
        channelCache.current[channel].data = [];
    }

    while(i<listofmsg.length){
        if(listofmsg[i] == "del"){
            i++;
            continue;
        }

        const msg = listofmsg[i];

        let content = JSON.parse(msg.content);

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
            const response = await fetch(`${server}/api/getusername?userid=${msg.sender}`)
            let data = await response.text();
            id2username[msg.sender] = data;
            msg.username = data.split("#")[0];
        }

        try{
            if(content.img){
                processed_.push({"sender":msg.sender, "username":msg.username, "timestamp":timestring, "img":content.img, "channel":channel, "key":msg.ID});
            }else if(typeof content === 'string' || content instanceof String){ //pure text message
                processed_.push({"sender":msg.sender, "username":msg.username, "timestamp":timestring, "text":content, "key":msg.ID});
            }
            channelCache.current[channel]["data"].push(processed_[processed_.length-1]);
        }catch(e){}
        i++;
    }
    setData((data)=>[...processed_, ...data]);
}

const removeMessage = (setData, channel, channelCache, messageid)=>{
    setData((data)=>data.filter((item)=>{if(item.key !== messageid){return item;}}));
    channelCache.current[channel].data = channelCache.current[channel].data.filter((item)=>{if(item.key !== messageid){return item;}});
}

const SendHandler = (socket, channel, setData, channelCache, message, username)=>{
    if(message.fileIds){
        socket.emit('incoming', JSON.stringify([channel, {"img":message.fileIds}]), (response)=>{
            if(response.res == "ok"){
                addMessage(setData, channelCache, channel, {"sender":username, "timestamp":response.timestamp,"ID":response.id, "content":{"img":message.fileIds}}, false, true);
            }
        });
    }else{
        socket.emit('incoming', JSON.stringify([channel, message]), (response)=>{
            if(response.res == "ok"){
                addMessage(setData, channelCache, channel, {"sender":username, "timestamp":response.timestamp, "ID":response.id, "content":message}, false, true);
            }
        });
    }
}

export const ChatMain = ({navigation, socket, username, setSocket, setUsername})=>{
    const [channels,setChannels] = useState([]);//store info of every channel

    const [data, setData] = useState(); //store rendered messages 
    const [more, setMore] = useState(true); //if there is more history message to load
    const [page, setPage] = useState(0); //how much history has loaded
    const [contentOffset, setContentOffset] = useState(0); //where the user is in the list of messages
    const contentOffsetRef = useRef();
    contentOffsetRef.current = contentOffset;
    const [channel, setChannel] = useState(0);//selected channel id
    const channelRef = useRef();
    channelRef.current=channel;
    const [ownership, setOwnership] = useState(false);//if user owns the current channel
    const [selectedChannelName, SetSelectedChannelName] = useState(); //current channel name
    const [openShareModal, setOpenShareModal] = useState(false);
    const [openChannelMenu, SetOpenChannelMenu] = useState(false);
    const openChannelMenuRef = useRef();
    openChannelMenuRef.current = openChannelMenu;
    const openMemberList = useRef(false);
    const [files, setFiles] = useState(); //files(uri, type, size, name) selected through image gallery
    const [messageMenuActive, setMessageMenuActive] = useState(false);
    const [openImageView, setOpenImageView] = useState(null);
    const [hasLoggedOut, setLogout] = useState(false);
    const channelCache_ = useRef({}); //store every message received from server
    const messageContainer = useRef();
    const animateMessageMenu = useRef(new Animated.Value(180)).current;

    useEffect(()=>//prevent user from going to login page by swiping
        navigation.addListener('beforeRemove', (e)=>{
            if(hasLoggedOut){return;}
            e.preventDefault();
        })
    ,[navigation, hasLoggedOut])
    useEffect(()=>{
        if(hasLoggedOut){
            navigation.navigate("Login");
        }
    }, [hasLoggedOut]);

    const swapChannel = (channel_id, channel_name)=>{
        offMessageMenu();
        toggle_channel_menu();//close channel menu
        //console.log(channelCache_.current[channelRef.current]);
        if(openMemberList.current){
            toggle_members_list();
        }
        if(channel_id==""){
            setChannel(false);
            SetSelectedChannelName(false);
            return;
        }
        
        if(channelCache_.current[channelRef.current]){
            channelCache_.current[channelRef.current].contentOffset = contentOffsetRef.current;
        }

        //reset values
        setChannel(channel_id);
        SetSelectedChannelName(channel_name);
        setData([]);
        setPage(1);
        setMore(false);
        setContentOffset(0);
        
        //check if we cached the channel
        if(channel_id in channelCache_.current){
            //restore saved data
            let saved = channelCache_.current[channel_id];

            setData(saved["data"]);
            if(saved.moretoload){
                setMore(true);
            }
            
            if(saved.contentOffset){
                console.log("offset:"+saved.contentOffset);
                setContentOffset(saved.contentOffset);
            }
        }else{
            loader(channel_id);
        }
    }

    //socket connection
    useEffect(()=>{
        const onMessage = (data)=>{
            let msg = JSON.parse(data);
            addMessage(setData, channelCache_, channelRef.current, msg, false, false, channels);
        }

        const onDelete = (data)=>{
            let todelete = JSON.parse(data);
            removeMessage(setData, todelete.channel, channelCache_, todelete.ID);
        }

        //socket.on('connect', onConnect);
        //socket.on('disconnect', onDisconnect);
        socket.on('message', onMessage);
        socket.on('delete', onDelete);

        //socket.on('connect_error',(err)=>console.log(err));

        return () => {
            //socket.off('connect', onConnect);
            //socket.off('disconnect', onDisconnect);
            socket.off('message', onMessage);
        };
    },[socket, channels]);
    
    const loader = useCallback(async (channel_) => {
        let response;
        try{
            response = await fetch(`${server}/api/loadmessage?channel=${channel_?channel_:channel}&page=${channel_?0:page}`);
        }catch(err){
            console.log(err);
        }
        var newData = await response.json();
        
        if(newData.status=="fail"){
            setChannel(false);
            return false;
        }

        newData=newData.data;
        channelCache_.current[channel_] = {};

        if(newData.slice(-1)[0] === "end"){
            setMore(false);
            channelCache_.current[channel_].moretoload = false;
            newData.pop();
        }

        await addMessage_more(channel_?channel_:channel, setData, channelCache_, newData);

        if(!channel_){
            setPage((page) => page+1);
        }
    },[page]);

    const DeleteHandler = useCallback((messageid) => {
        socket.emit('delete', JSON.stringify([channel, messageid]), (response)=>{
            if(response.res == "ok"){
                removeMessage(setData, channel, channelCache_, messageid);
            }
        });
    },[socket, channel])

    const channelmenu_slide = useRef(new Animated.Value(-Dimensions.get("window").width)).current;
    const toggle_channel_menu = ()=>{
        let openChannelMenu = openChannelMenuRef.current;
        Keyboard.dismiss();
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
        if(!openMemberList.current){
            Animated.timing(memberlist_slide, {
                useNativeDriver:true,
                toValue:0,
                duration:300
            }).start();
            openMemberList.current = true;
        }else{
            Animated.timing(memberlist_slide, {
                useNativeDriver:true,
                toValue:-Dimensions.get("window").height,
                duration:300
            }).start();
            openMemberList.current = false;
        }
    }

    const handleLogout = ()=>{
        fetch(`${server}/api/logout`);
        setLogout(true);
    }

    const activateMessageMenu = useCallback((item)=>{
        if(!messageMenuActive){
            setMessageMenuActive(item);
            return true;
        }
        return false;
    }, [messageMenuActive]);
    const offMessageMenu = useCallback(()=>{
        setMessageMenuActive(false);
    },[]);

    useEffect(()=>{
        if(messageMenuActive){
            Animated.timing(animateMessageMenu, {
                useNativeDriver:true,
                toValue:0,
                duration:500
            }).start();
        }else{
            Animated.timing(animateMessageMenu, {
                useNativeDriver:true,
                toValue:180,
                duration:500
            }).start();
        }
    },[messageMenuActive])

    const onScroll = (event)=>{
        setContentOffset(event.nativeEvent.contentOffset.y);
    }

    useEffect(()=>{if(messageContainer.current)setTimeout(()=>{messageContainer.current.scrollToOffset({animated:false, offset:contentOffset});},120)}, [channel]);

    const onLoadListener = useCallback(({elapsedTimeInMs})=>{
        console.log("elapsed load time:",elapsedTimeInMs);
    },[])

    return(
        <>
            {
                openShareModal && <Modal title={"群聊ID"} close_func={()=>{setOpenShareModal(false)}} content={
                <ChannelSharer channel={channel}/>} />
            }
            <View style={chat.top_menu}>
                <View style={{flex:1, flexDirection:'row'}}>
                    <View style={{flex:1}}>
                        <Pressable onPress={toggle_channel_menu}>
                            <Image source={sheepchat_icon} style={chat.menu_icon}></Image>
                        </Pressable>
                    </View>
                    <View style={{flex:2, alignItems:'center'}}>
                        <Text style={{...styles.large_text, marginTop:-3, zIndex:1}}>{selectedChannelName}</Text>
                    </View>
                    <View style={{flex:1, flexDirection:'row'}}>
                        {selectedChannelName&&
                            <>
                                <Pressable onPress={()=>{setOpenShareModal(true)}}>
                                    <Image source={share_icon} style={chat.menu_icon}></Image>
                                </Pressable>
                                <Pressable onPress={toggle_members_list}>
                                    <Image source={ownership?settings_icon:members_icon} style={chat.menu_icon}></Image>
                                </Pressable>
                            </>
                        }
                        {!selectedChannelName&&
                            <Pressable onPress={handleLogout}>
                                <View style={{flex:1, flexDirection:'row', justifyContent:'center'}}>
                                    <Text style={{...styles.text,marginTop:3}}>退出</Text>
                                    <Image source={logout_icon} style={{width:25,height:25,marginTop:3,marginLeft:3}} />
                                </View>
                            </Pressable>
                        }
                    </View>
                </View>
            </View>
            
            <channelContext.Provider value={{channels, setChannels, swapChannel}}>
                <ChannelMenu socket={socket} navigation={navigation} style={{transform:[{translateX:channelmenu_slide}]}} swapChannel={swapChannel} channel={channel} />
                
                {channel?//display startup screen or chat screen based on whether user selected channel
                <>
                    <ChannelSettings style={{transform:[{translateY:memberlist_slide}]}} channel={channel} username={username} socket={socket} close_func={toggle_members_list} ownership={ownership} setOwnership={setOwnership} setSelectedChannelName={SetSelectedChannelName}/>
                    <View style={chat.chat_main}>
                        {data.length > 0 && //the list is not rendered until data is loaded
                        <FlashList
                            inverted
                            data={data}
                            renderItem={({item})=><MessageItem item={item} setOpenImageView={setOpenImageView} setMessageMenuActive={activateMessageMenu} offMessageMenu={offMessageMenu} />}
                            ListFooterComponent={<Text style={{...styles.header, marginBottom:20}}>欢迎使用羊论。</Text>}
                            ref={messageContainer}
                            onLoad={onLoadListener}
                            onScroll={onScroll}
                            estimatedFirstItemOffset={190}
                            estimatedItemSize={80}
                            scrollEnabled={!messageMenuActive}
                            keyExtractor={(item)=>item.key}
                        />}
                    </View>
                    <MessageItemOperations offMessageMenu={offMessageMenu} animateMenuSlide={animateMessageMenu} DeleteHandler={DeleteHandler} item={messageMenuActive} />
                    {contentOffset > 1200 && <View style={{width:'100%', alignItems:'center'}}><MoveToEndButton onPress={()=>{offMessageMenu(); messageContainer.current.scrollToOffset({animated:true, offset:0})}} /></View>}

                    <ChatSender SendHandler={(message)=>{SendHandler(socket, channel, setData, channelCache_, message, username)}} onFocus={()=>offMessageMenu()} setFiles={setFiles} files={files} channel={channel} />
                    {openImageView && <LargeImageView source={openImageView[0]} index={openImageView[1]} closefunc={()=>{setOpenImageView(false)}} />}
                </>
                :
                <ChatHome username={username} setUsername={setUsername} setLogout={setLogout} setSocket={setSocket} navigation={navigation} />
                }
            </channelContext.Provider>
        </>
    )
}