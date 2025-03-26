import { server } from "../server_addr";
import { StyleSheet, View, Image, Pressable, Dimensions } from "react-native";
import { ZoomImage } from "./zoomimage";
import close_icon from "../assets/cross.png";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import Carousel, {Pagination} from "react-native-snap-carousel";
import { RippleButton } from "./ripplebutton";
import RNFetchBlob from 'rn-fetch-blob';
import { useEffect, useRef, useState } from "react";

const handleImageSave = (source, setSaveSuccess)=>{
    var uri;
    if(source.uri){
        uri = source.uri;
    }else{
        uri = source;
    }
    RNFetchBlob.config({
        fileCache: true,
        appendExt:'jpg'
    })
    .fetch('GET', uri)
    .then(res=>{
        console.log(res.data);
        
        CameraRoll.save(res.data, 'photo').then(()=>setSaveSuccess(true));
    })
}

export const LargeImageView = ({source, index, closefunc})=>{
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const [enableCarousel, setCarousel] = useState(true);
    const carousel = useRef();

    useEffect(()=>{
        console.log(index)
        carousel.current.snapToItem(index, false);
    }, [source, index]);

    return (
        <View style={style.overlay}>
            <Pressable onPress={closefunc} style={{flexDirection: 'row', flex: 1, zIndex:1}}>
                <Image source={close_icon} style={{width:40, height:40, marginLeft:'auto'}}></Image>
            </Pressable>
            <Carousel 
                ref={carousel}
                scrollEnabled={enableCarousel}
                data={source}
                renderItem={({item})=><ZoomImage source={{"uri":`${server}/api/getfile?id=${item}`}} setCarousel={setCarousel} />}
                sliderWidth={Dimensions.get("window").width}
                itemWidth={Dimensions.get("window").width}
                onSnapToItem={(index)=>setImageIndex(index)}
            />
            <Pagination
                dotsLength={source.length}
                activeDotIndex={imageIndex}
                carouselRef={carousel}
                dotColor="white"
                inactiveDotColor="grey"
                dotContainerStyle={{
                    height:5,
                    marginBottom:20
                }}
            />
            <View style={{position:'absolute', bottom:0,  width:'100%', alignItems:'center'}}> 
                <RippleButton style={{width:100}} content={saveSuccess?"保存成功":"保存至相册"} textcolor={"black"} onClick={()=>{if(!saveSuccess){handleImageSave(`${server}/api/getfile?id=${source[imageIndex]}`, setSaveSuccess)}}} />
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    overlay:{
        position:'absolute',
        top:0,
        bottom:0,
        left:0,
        right:0,
        backgroundColor:'rgba(0,0,0,0.84)'
    }
});