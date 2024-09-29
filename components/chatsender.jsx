import { server } from "../server_addr";
import picture_icon from "../assets/image.png";
import url_icon from "../assets/curlybracket.png";
import attach_icon from "../assets/paperclip.png";
import {launchImageLibrary} from 'react-native-image-picker';
import {chat} from '../stylesheets/chatstyles';
import { Modal } from "./modal";
import { View, Text, Image, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { styles } from "../stylesheets/styles";
import { RippleButton } from "./ripplebutton";
import { LoadIndicator } from "./loadindicator";

const upload_files = async (server, files, channel, setUploadErr)=>{
  const formData = new FormData();
  formData.append("channel_id", channel);
  files.forEach((file)=>{
    formData.append('images',{
      uri:file.uri,
      type:file.type,
      name:file.fileName
    })
  });

  var response = await fetch(`${server}/api/uploadimg`, {
    method: 'POST',
    body: formData,
    headers:{
      'Content-Type':'multipart/form-data'
    }
  }).catch((e)=>{
    setUploadErr("上传失败，请重试。");
    console.log(e);
  });

  if(!response){
    return false;
  }

  data = await response.json();
  
  if(data.status == "success"){
    setUploadErr(false);
    return data.all_ids;
  }
  return false;
}

export const ChatSender = ({SendHandler, setFiles, files, channel, onFocus})=>{
    const [openAttachModal, setOpenAttachModal] = useState(false);
    const [drafts, setDrafts] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadErr, setUploadErr] = useState(false);

    const launchNativeImageLibrary = () => {
        let options = {
          mediaType:'photo',
          selectionLimit:5
        };
        launchImageLibrary(options, (response) => {
          if (!response.didCancel && !response.errorCode){
            setFiles(response.assets);
          }
        });
      }

    const handle_image_send = async()=>{
      var ids = await upload_files(server, files, channel, setUploadErr);
      if(!ids){
        setIsUploading(false);
        return false;
      }
      setOpenAttachModal(false);
      setFiles();
      setIsUploading(false);
      SendHandler({'fileIds':ids});
    }

    return(
        <>
        {
            openAttachModal && <Modal title={"发送图片"} close_func={()=>{setOpenAttachModal(false)}} content={
                <>
                  {files?
                    <>
                      {isUploading?<LoadIndicator />:
                        <View>
                          <View style={{margin:20, flexDirection:'row', flexWrap:'wrap'}}>
                            {files.map((file, index)=>(
                              <Image style={chat.attachment_thumbnail} key={index} source={{"uri":file.uri}} />
                            ))}
                          </View>
                          <Text style={styles.error_text}>{uploadErr}</Text>
                          <View style={{flexDirection:'row'}}>
                            <RippleButton style={{flex:1, margin:5}} content={"重新选择"} onClick={()=>{launchNativeImageLibrary()}}></RippleButton>
                            <RippleButton style={{flex:1}} content={"确认"} onClick={()=>{setIsUploading(true); handle_image_send();}}></RippleButton>
                          </View>
                        </View>
                      }
                    </>
                  :
                  <View style={{padding:'10%', flexDirection:'row'}}>
                      <Pressable style={{justifyContent:'center', alignItems:'center', margin:10}} onPress={()=>{launchNativeImageLibrary()}}>
                          <Image style={{width:80, height:80}} source={picture_icon} />
                          <Text style={styles.text}>从相册选择</Text>
                      </Pressable>
                      <View style={{justifyContent:'center', alignItems:'center', margin:10}}>
                          <Image style={{width:80, height:80}} source={url_icon} />
                          <Text style={styles.text}>使用url</Text>
                      </View>
                  </View>}
                </>
                }
            />
        }
        <View style={chat.send}>
            <TextInput 
              multiline 
              style={chat.sendinput} 
              onFocus={onFocus} 
              onKeyPress={(e)=>{if(e.nativeEvent.key=='Enter'){SendHandler(drafts[channel]); 
              setTimeout(()=>{setDrafts((drafts)=>({...drafts, [channel]:""}))}, 0); }}} 
              value={drafts[channel]} 
              onChangeText={(text) => setDrafts((drafts)=>({...drafts, [channel]:text}))} 
              placeholder="换行发送消息" 
              placeholderTextColor={'#ffffff'} 
            />

            <Pressable style={chat.attachment_button} onPress={()=>{setOpenAttachModal(true)}}>
                <Image style={{width:30, height:30}} source={attach_icon} />
            </Pressable>
        </View>
        </>
    )
}