import { StyleSheet, Text, Image, Pressable } from "react-native"
import { styles } from "../stylesheets/styles"

import arrow_icon from "../assets/arrowdown.png"

export const MoveToEndButton = ({onPress})=>{
    return (
        <Pressable onPress={onPress} style={my_styles.container}>
            <Image style={my_styles.icon} source={arrow_icon} />
            <Text style={styles.text}>返回底部</Text>
            <Image style={my_styles.icon} source={arrow_icon} />
        </Pressable>
    )
}

const my_styles = StyleSheet.create({
    container:{
        position:'absolute',
        bottom:0,
        width:'50%',
        height:30,
        flexDirection:'row',
        backgroundColor:'#44534E',
        borderTopEndRadius:8,
        borderTopStartRadius:8,
        justifyContent:'center'
    },
    icon:{
        width:20,
        height:20
    }
})