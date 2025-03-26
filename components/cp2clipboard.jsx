import { useRef, useState } from "react";
import { Animated, Pressable, View, Text } from "react-native";
import copyimg from "../assets/copy.png";
import copiedimg from "../assets/copied.png";
import { styles } from "../stylesheets/styles";

export const ClipboardIcon = ({onClick})=>{
    const opacity_animation = useRef(new Animated.Value(0)).current;

    const handleClick = ()=>{
        onClick();
        Animated.sequence([
            Animated.timing(opacity_animation, {
                useNativeDriver:true,
                toValue:1,
                duration:200
            }),
            Animated.timing(opacity_animation, {
                useNativeDriver:true,
                toValue:0,
                duration:250
            })
        ]).start();
    }

    return(
        <Pressable style={{flexDirection:'row'}} onPress={handleClick}>
            <Animated.Image source={copiedimg} style={{marginRight:-25,marginTop:3, width:20, height:20, opacity:opacity_animation}} />
            <Animated.Image source={copyimg} style={{marginRight:5, marginLeft:5, marginTop:3, width:20, height:20, opacity:opacity_animation.interpolate({inputRange:[0,1], outputRange:[1,0]})}} />
            <Text style={styles.text_white}>复制</Text>
        </Pressable>
    )
    
}