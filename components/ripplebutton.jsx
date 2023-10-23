import { useState } from "react";
import { Pressable, StyleSheet, View, Text, Animated } from "react-native"
import { styles } from "../styles";
export const RippleButton = ({style, onClick, content})=>{
    const [spanStyles, setSpanStyles] = useState([]);
    const [buttonWidth, setButtonWidth] = useState(0);
    const [timeOut, setTimeOut] = useState();
    
    const startRipple = (e)=>{
        const size = buttonWidth;
        const x = e.nativeEvent.locationX;
        const y = e.nativeEvent.locationY;
        const spanStyles_ = { top: y, left: x, height: size, width: size/2 };
        const animated_opacity = new Animated.Value(0.75);
        const animated_scale = new Animated.Value(0);
        Animated.timing(animated_opacity, {
            toValue:0,
            useNativeDriver:true,
            duration:850
        }).start();
        Animated.timing(animated_scale, {
            toValue:2,
            useNativeDriver:true,
            duration:850
        }).start();
        
        setSpanStyles((spanStyles)=>[...spanStyles, [spanStyles_, animated_opacity, animated_scale]]);
    }
    
    const callCleanUp = (delay)=>{
        clearTimeout(timeOut);
        setTimeOut(setTimeout(()=>{
            setSpanStyles([]);
        }, delay)); //store timeout inside the state so it can be cleared
    }
    return (
        <Pressable style={{...mystyles.pressable, ...styles.button, ...style}} onPress={onClick} onLayout={(e)=>{setButtonWidth(e.nativeEvent.layout.width);}} onPressIn={startRipple} onPressOut={()=>{callCleanUp(2000)}}>
            <Text style={{color:'#ffffff'}}>{content}</Text>
            
            <View style={mystyles.ripple_container}>
                {
                    spanStyles.map((value, index)=>{
                        return (
                            <Animated.View key={index} style={{...mystyles.ripples, ...value[0], opacity:value[1], transform:[{'scale':value[2]}]}}></Animated.View>
                        )
                    })
                }
            </View>
        </Pressable>
    )
}

const mystyles = StyleSheet.create({
    pressable:{
        position:"relative",
        overflow:"hidden"
    },
    ripple_container:{
        position:"absolute",
        top:0,
        bottom:0,
        right:0,
        left:0
    },
    ripples:{
        borderRadius: 50,
        position: 'absolute',
        backgroundColor: 'white'
    }
});