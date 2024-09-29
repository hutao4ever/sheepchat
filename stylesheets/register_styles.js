import { StyleSheet, Dimensions } from "react-native";

export const mystyles = StyleSheet.create({
    registerContainer:{
      position:'absolute',
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex:1,
      backgroundColor: '#1b211f'
    },
    
    register:{
      overflowY: 'scroll',
      overflowX: 'hidden'
    },
    
    register_form:{
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      marginLeft:10,
      width:Dimensions.get("window").width,
      height:Dimensions.get("window").height
    },
    
    register_h2:{
      margin: 0
    },
    
    register_label:{
      marginTop: 30
    },
    
    register_img:{
      resizeMode:'contain',
      width: 70,
      height: 70
    },
    
    register_error:{
      margin: 2
    },
    
    register_ul:{
      marginBlock: 5
    },
    
    registerSlidePanel:{
      position: 'absolute'
    },

    registerResult:{
      alignItems: 'center',
      width:Dimensions.get("window").width,
      paddingTop:'50%'
    },
  
    banner:{
      position:'relative',
      width:'100%',
      height:100,
      borderBottomWidth:2,
      borderBottomColor:'white',
      flexDirection: 'row',
      alignItems:'center'
    },
  
    spacer:{
      height:300
    },
  
    input:{
      width:'85%'
    },
  
    button:{
      width:150
    },
  
    error_text:{
      color: '#42BFDD'
    }
  });