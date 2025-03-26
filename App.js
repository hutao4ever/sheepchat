import { server, setServer, server_candidates } from './server_addr';
import { StatusBar, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Background } from './components/background';
import { Login } from './components/login';
import { Register } from './components/register';
import { ChatMain } from './components/chat';
import { useState, useEffect } from 'react';
import { styles } from './stylesheets/styles';
import { loginDB } from './localdb';
import { ConnectionStatusDisplay } from './components/connectionstat';

import './cache_manager';

/** Warning: spghetti code */

const Stack = createNativeStackNavigator();

const LoginPage = ({navigation, theme, setSocket, setUsername, setUserID, setLoginStatus, serverName})=>{
  return (
    <>
      <StatusBar backgroundColor={'#1b211f'} />
      <Background theme={theme} />
      <View style={styles.center_container}>
        <Login navigation={navigation} setSocket={setSocket} setLocalUsername={setUsername} setUserID={setUserID} setLoginStatus={setLoginStatus} />
        <ConnectionStatusDisplay server_name={serverName} />
      </View>
    </>
  )
}

const RegisterPage = gestureHandlerRootHOC(({navigation})=>{
  return (
    <Register navigation={navigation} />
  )
})

const ChatPage = gestureHandlerRootHOC((props)=>{
  return (
    <>
    <StatusBar backgroundColor={'#1b211f'} />
    <Background theme={props.theme} />
    <ChatMain {...props}/>
    </>
  )
})

const checkconnect = async(setNetworkError, setServerName, only_check)=>{
  var fastest_response;
  var promises = [];

  if(only_check){
    try{
      await fetch(`${server}/api/checkauth`);
    }catch(e){
      setServerName(false);
      setNetworkError("无法连接服务器，请检查网络");
      setTimeout(()=>{checkconnect(setNetworkError, setServerName)}, 3000);
      return;
    }
    setNetworkError(false);
    setTimeout(()=>{checkconnect(setNetworkError, setServerName, true)}, 3000);
    return;
  }

  for(const server_ of server_candidates){
    promises.push(
    fetch(`${server_[0]}/api/checkauth?timestamp=${Date.now()}`).then((response)=>response.json())
    .then((data)=>{
      //console.log(data);
      if(fastest_response){
        if(parseInt(data.latency)<fastest_response){
          fastest_response = parseInt(data.latency);
          setServer(server_[0]);
          setServerName(server_[1]);
        }
      }else{
        fastest_response = parseInt(data.latency);
        setServer(server_[0]);
        setServerName(server_[1]);
      }
    })
    .catch((e)=>{}));
  }

  await new Promise.all(promises);
  
  if(!fastest_response){
    setNetworkError("无法连接服务器，请检查网络");
    setTimeout(()=>{checkconnect(setNetworkError, setServerName)}, 3000);
  }else{
    setNetworkError(false);
    setTimeout(()=>{checkconnect(setNetworkError, setServerName, true)}, 3000);
  }
}

export default function App() {
  const [theme, setTheme] = useState(false);
  const [username, setUsername] = useState();
  const [userID, setUserID] = useState();
  const [loginStatus, setLoginStatus] = useState();
  const [networkError, setNetworkError] = useState(false);
  const [serverName, setServerName] = useState();
  const [socket, setSocket] = useState();

  useEffect(()=>{
    checkconnect(setNetworkError, setServerName);
  },[]);

  useEffect(()=>{
    //update remembered credentials when username changes
    if(username){
      loginDB.transaction(transaction=>{
        transaction.executeSql("UPDATE credentials SET username = ? WHERE 1",
        [username],
        ()=>{},
        error=>{console.log(error)}
        )
      });
    }
  }, [username]);
  

  return (
    <View style={styles.app}>
      <NavigationContainer style={{marginTop:-50}}>
        <Stack.Navigator>
          <Stack.Screen options={{headerShown:false}} name='Login'>
            {(props) => <LoginPage {...props} theme={theme} setSocket={setSocket} setUsername={setUsername} setUserID={setUserID} setLoginStatus={setLoginStatus} serverName={serverName} />}
          </Stack.Screen>
          <Stack.Screen name='注册' component={RegisterPage} options={{headerStyle:{backgroundColor:'#BBE6E4'}}}/>
          <Stack.Screen name='Chat' options={{headerShown:false}}>
            {(props) => <ChatPage {...props} theme={theme} socket={socket} userID={userID} username={username} setUsername={setUsername} />}
          </Stack.Screen>  
        </Stack.Navigator>
    
        {networkError &&
        <View style={styles.bottom_error_popup}>
          <Text>{String(networkError)}</Text>
        </View>
        }
      </NavigationContainer>
    </View>
  );
}