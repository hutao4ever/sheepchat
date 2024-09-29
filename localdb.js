import { openDatabase } from "react-native-sqlite-storage";

export const loginDB = openDatabase({
    name:'credentials'
});
loginDB.transaction(transaction=>{
    transaction.executeSql("CREATE TABLE IF NOT EXISTS credentials (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(50), password VARCHAR(50))",
    [],
    (sqlTransaction, res)=>{},
    error=>{console.log(error)}
    )
})