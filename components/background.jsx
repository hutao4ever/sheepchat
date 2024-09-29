import bg from "../assets/bgdark.png";
import { View, Image } from 'react-native';

export const Background = ()=>{
    return(
        <View>
            <Image source={bg} resizeMode='cover' style={{position:'absolute', zIndex:-1}}></Image>
        </View>
    )
}