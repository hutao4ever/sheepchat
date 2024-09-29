import LinearGradient from 'react-native-linear-gradient';
import deleteicon from "../assets/trash.png";
import closeicon from "../assets/cross.png";
import { styles } from "../stylesheets/styles";
import { ClipboardIcon } from "./cp2clipboard";
import Clipboard from '@react-native-clipboard/clipboard';
import { Animated, Image, Text, Pressable } from 'react-native';
import { chat } from '../stylesheets/chatstyles';
import { useRef } from 'react';

export const MessageItemOperations = ({offMessageMenu, animateMenuSlide, DeleteHandler, item})=>{
    const ylocation = useRef();
    if(item){
        ylocation.current=item.py-20;
    }
    return (
        <Animated.View style={{position:'absolute', right:10, top:ylocation.current, transform:[{translateX:animateMenuSlide}]}}>
            <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 0}} colors={['#073591', '#567fd1', '#cf3879']} style={chat.msgActionmenu}>
                <ClipboardIcon onClick={()=>{if(!item.img){Clipboard.setString(item.text)}}} />
                <Pressable onPress={()=>{offMessageMenu(); DeleteHandler(item.key)}} style={{flexDirection:'row'}}>
                    <Image source={deleteicon} style={{width:20, height:20, marginRight:5, marginLeft:5, marginTop:3}} />
                    <Text style={styles.text}>删除</Text>
                </Pressable>
            </LinearGradient>
        </Animated.View>
    )
}