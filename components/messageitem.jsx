import { memo } from "react";
import { chat } from "../chatstyles";
import { View, Image, Text } from "react-native";
const _ = require('lodash');

function compare(a,b){
    return _.isEqual(a.item,b.item);
}

export const MessageItem = memo(({server, item})=>{
    const date = new Date();

    return (
        <View style={{marginVertical:5}}>
            <View style={{flexDirection:'row'}}><Image style={chat.profilepic} source={{uri:`${server}/api/getpfp?userid=${item.sender}&&${date.getDate()+date.getMinutes()}`}}></Image><Text style={chat.msgusername}>{item.username}</Text></View>
            <Text style={chat.timestamp}>{item.timestamp}</Text>
            {
                item.img?
                <View style={{width:260,height:260,margin:10}}>
                    <Image source={{"uri":item.img}} style={{flex:1,resizeMode:'cover'}}></Image>
                </View>
                :
                <Text style={chat.msgcontent}>{item.text || item.img}</Text>
            }
        </View>
    )
}, compare);