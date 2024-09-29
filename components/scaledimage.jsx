import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import placeholder from "../assets/image.png";

export const ScaledImage = ({source, width_, height_}) => {
    const [width, setWidth] = useState(150);
    const [height, setHeight] = useState(150);

    useEffect(()=>{
        if(width>200){
            width=200;
        }
        if(height>200){
            height=200;
        }
        if(!source.uri){
            var uri = Image.resolveAssetSource(source).uri;
        }else{
            var uri = source.uri;
        }
        //const uri = 0;
        Image.getSize(uri, (originalwidth, originalheight) => {
            if (width_ && !height_) {
                setWidth(width_);
                setHeight(originalheight * (width_ / originalheight));
            } else if (!width_ && height_) {
                setWidth(originalwidth * (height_ / originalwidth));
                setHeight(height_);
            } else {
                setWidth(width_);
                setHeight(height_);
            }
        });
    }, []);

   return (
        <>
       <Image
           source={source}
           defaultSource={placeholder}
           style={{ height: height, width: width }}
       />
       </>
   );
}