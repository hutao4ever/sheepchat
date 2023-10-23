import { useState } from "react";
import { View, Text } from "react-native";
import { ClipboardIcon } from "./cp2clipboard";
import { styles } from "../styles";
import { RippleButton } from "./ripplebutton";
import Clipboard from '@react-native-clipboard/clipboard';

export const ChannelSharer = ({server, channel})=>{
    const [isLoading, setIsLoading] = useState(false);
    const [code, setCode] = useState();

    const generate_code = ()=>{
        if(!isLoading){
            setIsLoading(true);
            fetch(`${server}/api/getjoincode`, {method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({"channel": channel})}).then(response => response.json()).then((data)=>{
                setCode(data.code);
                setIsLoading(false);
            }).catch((err)=>{
                setIsLoading(false);
            });
        }
    }

    return (
        <>
            {code?
            <View style={{backgroundColor:'#297644',padding:10,borderRadius:7,marginTop:10}}>
                <Text style={styles.text}>{code}</Text>
                <ClipboardIcon onClick={()=>{Clipboard.setString(code)}} />
            </View>:
            <RippleButton content={"生成邀请码"} onClick={generate_code}></RippleButton>
            }
        </>
    )
}