import { server } from "../server_addr";
import { memo } from "react";
import { chat } from "../stylesheets/chatstyles";
import { View, Text, Pressable } from "react-native";
import { ScaledImage } from "./scaledimage";
import { Dimensions } from "react-native";
import { CachedImage } from '@georstat/react-native-image-cache';

export const MessageItem = memo(({item, setOpenImageView, setMessageMenuActive})=>{
    if(item.img){
        if(item.img.length > 2){
            var image_width = (Dimensions.get("window").width-50)/3;
        }else{
            var image_width = (Dimensions.get("window").width-50)/2;
        }
    }

    return (
        <Pressable style={{marginVertical:5, width:'100%'}} onPress={()=>setMessageMenuActive(false)}>
            <View style={{flexDirection:'row'}}><CachedImage maxAge={10} style={chat.profilepic} source={`${server}/api/getpfp?userid=${item.sender}`} thumbnailSource=""></CachedImage><Text style={chat.msgusername}>{item.username}</Text></View>
            <Text style={chat.timestamp}>{item.timestamp}</Text>
            <Pressable style={{PaddingVertical:5}} onPress={()=>setMessageMenuActive(false)} onLongPress={(PressEvent)=>setMessageMenuActive((oldvalue)=>!oldvalue && {...item, 'py':PressEvent.nativeEvent.pageY})}>
                <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                    {
                        item.img?
                        item.img.map((listitem, index)=>
                        <Pressable key={index} style={{margin:5}} onPress={()=>{setOpenImageView([item.img, index])}} onLongPress={(PressEvent)=>setMessageMenuActive((oldvalue)=>!oldvalue && {...item, 'py':PressEvent.nativeEvent.pageY})}>
                            <ScaledImage source={{"uri":`${server}/api/getfile?id=${listitem}`}} width_={image_width} />
                        </Pressable>)
                        :
                        <Text style={chat.msgcontent}>{item.text}</Text>
                    }
                </View>
            </Pressable>
        </Pressable>
    )
})