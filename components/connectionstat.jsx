import { StyleSheet, View, Text, Image } from "react-native"
import { styles } from "../stylesheets/styles";
import crossred from "../assets/cross_red.png";

export const ConnectionStatusDisplay = ({server_name})=>{
    return (
        <View style={mystyles.container}>
            {server_name?
            <>
                <View style={mystyles.green_dot_outer}>
                    <View style={mystyles.green_dot_inner}></View>
                </View>
                <Text style={styles.text}>连接端点:{server_name}</Text>
            </>
            :
            <>
                <Image style={mystyles.icon} source={crossred} />
                <Text style={styles.text}>未连接</Text>
            </>
            }
        </View>
    )
}

const mystyles = StyleSheet.create({
    container:{
        flexDirection:'row',
        margin:20,
        alignItems:'center'
    },
    green_dot_outer:{
        width:20,
        height:20,
        borderRadius:10,
        backgroundColor:'rgba(78,221,31,0.7)',
        alignItems:'center',
        justifyContent:'center',
        marginRight:5
    },
    green_dot_inner:{
        width:10,
        height:10,
        borderRadius:5,
        backgroundColor:'rgba(78,221,31,1)'
    },
    icon:{
        width:20,
        height:20,
        marginRight:5
    }
});