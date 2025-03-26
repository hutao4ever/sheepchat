import { StyleSheet,Dimensions } from 'react-native';

const text_color = "#1B1725";
const background_color = "#F1EFEC";

export const styles = StyleSheet.create({
    app:{
        position:'absolute',
        top:0,
        bottom:0,
        left:0,
        right:0,
        backgroundColor:background_color
    },
    error_text:{
        color:'#edb415'
    },
    button:{
        marginTop: 20,
        height: 35,
        backgroundColor: background_color,
        borderWidth: 1.5,
        borderStyle: 'solid',
        borderColor: '#4e4b5c',
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    link:{
        height: 25,
        width: '100%',
        borderBottomWidth: 1.5,
        borderStyle: 'solid',
        borderColor: '#4e4b5c',
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    input:{
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width:'100%',
        borderWidth: 1.5,
        borderStyle: 'solid',
        borderColor: '#4e4b5c',
        color: text_color,
        height: 30,
        borderRadius: 3,
        marginTop: 10,
        marginBottom: 10,
        padding: 5
    },
    center_container:{
        position:'absolute',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex:1
    },
    version_info:{
        position:'absolute',
        top:Dimensions.get("window").height-40,//prevent keyboard from pushing this up
        alignItems:'center'
    },
    version_text:{
        color:'#034efc'
    },
    login_container:{
        width:200
    },
    main_logo:{
        backgroundColor:'rgb(30,30,30)',
        width:85,
        height:85,
        marginBottom:10,
        borderRadius:10,
        padding:5
    },
    text:{
        color:text_color,
        fontSize:16
    },
    text_white:{
        color:"white",
        fontSize:16
    },
    large_text:{
        color:text_color,
        fontSize:22
    },
    header:{
        color:"#ffffff",
        fontSize:32
    },
    link_text:{
        color: '#0000EE',
        textDecorationLine:'underline',
        textDecorationColor: '#0000EE'
    },
    bottom_error_popup:{
        backgroundColor:'#ffd000',
        position:'absolute',
        bottom:0,
        left:0,
        right:0,
        height:30,
        alignItems:'center'
    },
    tiny_icon:{
        width:20,
        height:20,
        marginTop:15,
        marginLeft:5
    }
});