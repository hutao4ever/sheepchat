import { Pressable, Text, View, StyleSheet } from "react-native"
import { styles } from "../stylesheets/styles"
import {Dimensions} from 'react-native';

const modal = StyleSheet.create({
    overlay:{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.84)',
        zIndex: 3,
        alignItems:'center',
        justifyContent:'center'
    },
    container:{
        padding:15,
        borderRadius:3,
        backgroundColor:'#F1EFEC',
        minWidth:200,
        maxWidth:Dimensions.get('window').width-20
    }
});

export const Modal = ({title, content, close_func, interactions})=>{
    return (
        <View style={modal.overlay}>
            <View style={{...modal.container}}>
                <Pressable onPress={close_func} style={{alignSelf:'flex-start'/*makes button width fit text*/}}><Text style={styles.text}>X</Text></Pressable>
                <View>
                    {title && <Text style={styles.large_text}>{title}</Text>}
                    {content}
                    {interactions}
                </View>
            </View>
        </View>
    )
}