import { useRef, useState } from "react";
import { Animated, Pressable, View, Text } from "react-native";
import copyimg from "../assets/copy.png";
import copiedimg from "../assets/copied.png";
import { styles } from "../styles";

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
        <View style={{alignSelf:'flex-end'}}>
            <Pressable style={{flexDirection:'row'}} onPress={handleClick}>
                <Text style={styles.text}>复制</Text>
                <Animated.Image source={copiedimg} style={{position:'relative', right:-25, marginLeft:5,marginTop:3, width:20, height:20, opacity:opacity_animation}} />
                <Animated.Image source={copyimg} style={{marginLeft:5,marginTop:3, width:20, height:20, opacity:opacity_animation.interpolate({inputRange:[0,1], outputRange:[1,0]})}} />
            </Pressable>
        </View>
    )
    
}