import { Pressable, Text, View, StyleSheet } from "react-native"
import { styles } from "../styles"
import { useEffect, useRef, useState } from "react";

const modal = StyleSheet.create({
    container:{
        padding:15,
        borderRadius:3,
        backgroundColor:'#2c3632',
        width:200,
        height:100
    }
});

const update_animation = (counter, setString) => {
    let string1 = '114514';
    let string = '- '.repeat(counter);
    if(counter != 7){
        string = string + string1.charAt(counter);
    }
    if(counter<6){
        string = string + ' -'.repeat(5-counter);
    }
    counter ++;
    setString(string);
    if(counter > 7){
        counter = 0;
    }
    setTimeout(()=>{update_animation(counter, setString)}, 200);
}

export const LoadIndicator = ()=>{
    const count = useRef(0);
    const [string, setString] = useState("");

    useEffect(()=>{
        update_animation(count.current, setString);
    },[]);

    return (
        <View style={{...modal.container}}>
            <View>
                <Text style={styles.text}>{string}</Text>
                <Text style={styles.text}>加载中</Text>
            </View>
        </View>
    )
}