import { Text, View } from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Background } from './components/background';
import { Login } from './components/login';
import { Register } from './components/register';
import { Chatmessage } from './components/chat';
import { useState, useEffect } from 'react';
import { styles } from './styles';

const Stack = createNativeStackNavigator();

const LoginPage = ({navigation, theme, setSocket, setUsername, setLoginStatus})=>{
  return (
    <>
      <Background theme={theme} />
      <View style={styles.center_container}>
        <Login navigation={navigation} server={server} setSocket={setSocket} setLocalUsername={setUsername} setLoginStatus={setLoginStatus} />
        {/*<ThemeSetter theme={theme} ChangeBackground={setTheme} />*/}
      </View>
    </>
  )
}

const RegisterPage = gestureHandlerRootHOC(({navigation})=>{
  return (
    <Register navigation={navigation} server={server}></Register>
  )
})

const ChatPage = gestureHandlerRootHOC((props)=>{
  return (
    <>
    <Background theme={props.theme} />
    <Chatmessage {...props}/>
    </>
  )
})

const server = "http://10.0.2.2:8080";

const checkconnect = (setNetworkError)=>{
  fetch(`${server}/api/checkauth`).then(()=>{
    setNetworkError(false);
  }).catch((error)=>{
    setNetworkError("无法连接服务器，请检查网络");
    setTimeout(()=>{checkconnect(setNetworkError)}, 3000);
  })
}

export default function App() {
  const [theme, setTheme] = useState(false);
  const [username, setUsername] = useState();
  const [loginStatus, setLoginStatus] = useState();
  const [networkError, setNetworkError] = useState(false);
  const [socket, setSocket] = useState();

  useEffect(()=>{
    checkconnect(setNetworkError);
  },[]);
  

  return (
    <View style={styles.app}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen options={{headerShown:false}} name='Login'>
            {(props) => <LoginPage {...props} theme={theme} setSocket={setSocket} setUsername={setUsername} setLoginStatus={setLoginStatus} />}
          </Stack.Screen>
          <Stack.Screen name='注册' component={RegisterPage}/>
          <Stack.Screen name='Chat' options={{headerShown:false, gestureEnabled:false}}>
            {(props) => <ChatPage {...props} theme={theme} socket={socket} setSocket={setSocket} server={server} username={username} setUsername={setUsername} />}
          </Stack.Screen>
          
          {/*
          <>
            <Background theme={theme} backgroundOnly={true} />
            <UserProfile username={username} setUsername={setUsername} setLoginStatus={setLoginstatus}/>
            <div className='grid'>
              <Chatmessage socket={socket.current} username={username}/>
            </div>
          </>
          <ChannelJoin/>
          */
          }
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