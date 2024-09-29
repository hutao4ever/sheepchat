import React, { useRef, useState } from "react";
import { Animated, View, Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

export const ZoomImage = ({source, setCarousel})=>{
    const [panEnabled, setPanEnabled] = useState(false);

    const scale = useRef(new Animated.Value(1)).current;
    const scaleValue = useRef(0);
    const scalePrev = useRef(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const zoomGesture = Gesture.Pinch()
    .shouldCancelWhenOutside(true)
    .onStart(()=>{
      setPanEnabled(false);
      setCarousel(false);
    })
    .onUpdate((event)=>{
      if(event.scale >= 1){
        if(scalePrev.current !== 0){event.scale-=1}
        if(scalePrev.current+event.scale < 3){
          scaleValue.current = scalePrev.current+event.scale;
          scale.setValue(scaleValue.current);
        }
      }else{
        if(scalePrev.current-1+event.scale > 1){
          scaleValue.current = scalePrev.current-1+event.scale;
        }else{
          scalePrev.current = 0;
          scaleValue.current = 1;
          
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true
          }).start();
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true
          }).start();
        }
        scale.setValue(scaleValue.current);
      }
    })
    .onEnd(()=>{
      scalePrev.current = scaleValue.current;
      if(scaleValue.current > 1){
        setPanEnabled(true);
      }else{
        setCarousel(true);
      }
    });

    const panGesture = Gesture.Pan()
    .enabled(panEnabled)
    .onUpdate((event)=>{
      translateX.setValue(event.translationX);
      translateY.setValue(event.translationY);
    })
    .onEnd((event)=>{
      if(Math.abs(event.translationX) > (Dimensions.get("window").width/2)){
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
      if(Math.abs(event.translationY) > (Dimensions.get("window").height/2)*0.4){
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
    });

    const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(()=>{
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true
        }).start();
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true
        }).start();
        Animated.spring(scale, {
            toValue:1,
            useNativeDriver:true
        }).start();
        setCarousel(true);
        setPanEnabled(false);
    });

    const composed = Gesture.Simultaneous(zoomGesture, panGesture, doubleTap);

    return (
        <View>
          <GestureDetector gesture={composed}>
              <Animated.Image 
                  source={source}
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: [{scale}, { translateX }, { translateY }]
                  }}
                  resizeMode="contain"
              />
          </GestureDetector>
        </View>
    )
}