import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    app:{
        flex: 1
    },
    video_background: {
        position:'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,
        zIndex:-1,
        aspectRatio:9/16
    },
    error_text:{
        color:'#f0cb65'
    },
    button:{
        marginTop: 20,
        height: 35,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 1.5,
        borderStyle: 'solid',
        borderColor: '#ffffff',
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    link:{
        marginTop: 20,
        height: 25,
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderBottomWidth: 1.5,
        borderStyle: 'solid',
        borderColor: '#ffffff',
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    input:{
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width:'100%',
        borderWidth: 1.5,
        borderStyle: 'solid',
        borderColor: '#ffffff',
        color: '#ffffff',
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
        bottom:0,
        alignItems:'center'
    },
    version_text:{
        color:'#034efc'
    },
    login_container:{
        width:200
    },
    main_logo:{
        backgroundColor:'rgba(50,147,168,0.5)',
        width:82,
        height:85,
        marginBottom:10,
        borderRadius:20
    },
    text:{
        color:"#ffffff",
        fontSize:16
    },

    header:{
        color:"#ffffff",
        fontSize:32
    },

    large_text:{
        color:"#ffffff",
        fontSize:24
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
    }
});