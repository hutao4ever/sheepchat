import bg from "../assets/bgdark.png";
import { View } from 'react-native';
import {styles} from '../stylesheets/styles';

export const Background = ()=>{
    return(
        <View style={{backgroundColor:styles.app.backgroundColor, position:"absolute", width:"100%", height:"100%"}}>
            {/*<Image source={bg} resizeMode='cover' style={{position:'absolute', zIndex:-1}}></Image>*/}
        </View>
    )
}