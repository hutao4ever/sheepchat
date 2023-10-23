import Video from 'react-native-video';
import bg from "../assets/bgdark.png";
import { useRef, useState } from 'react';
import { View, Image } from 'react-native';
import { styles } from '../styles'

export const Background = ()=>{
    /*
    var middle_timestamp = 4.167;
    var percentage = theme? 100:0;
    var video = useRef();
    const [paused, setPaused] = useState(true);

    const handleVideoMounted = ()=>{
        video.current.seek((1-percentage/100)*middle_timestamp);
    }

    const f_onProgress = (e)=>{
        let targetTime = (percentage/100+1)*middle_timestamp;//second half
        let targetTime2 = (1-percentage/100)*middle_timestamp;//first half

        if(e.currentTime+0.3 >= targetTime2 && e.currentTime-0.3 <= targetTime2){setPaused(true);return;}
        if(e.currentTime+0.3 >= targetTime && e.currentTime-0.3 <= targetTime){setPaused(true);return;}//goal!
    }*/

    return(
        <View>
            <Image source={bg} resizeMode='cover'  style={styles.video_background}></Image>
        </View>
    )

    

}