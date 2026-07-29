import Axios from "./axiosServices";
import {jwtDecode} from 'jwt-decode'


function login(user){
    return Axios.post("/users/login",user)
}
const saveToken = (token) => {
    localStorage.setItem('token', token);
}

const logOut=()=>{
    localStorage.removeItem('token')

}

const isLoged=()=>{
    let token=localStorage.getItem('token')
    return !!token;
}

const getToken=()=>{
    return localStorage.getItem('token');
}

const decoderToken=()=>{
    const token = getToken();
    const decodedToken = jwtDecode(token);
    console.log(decodedToken);
 return decodedToken
}
function getUsername(){
    const decoderTokenVar =decoderToken();
    const username = decoderTokenVar.sub;
    return username;
}

// --- NOUVELLE MÉTHODE POUR RÉCUPÉRER L'ID ---
function getUserId() {
    const decodedToken = decoderToken();
    if (!decodedToken) return null;
    
    // Le champ ID peut s'appeler 'id', 'user_id' ou parfois être dans 'sub' si c'est un UUID
    // Adaptez selon ce que votre backend Spring Boot/FastAPI met dans le JWT
    return decodedToken.id || decodedToken.user_id || decodedToken.sub;
}
// --------------------------------------------
function getUserConnecte() {
    const token = getToken();
    return Axios.get("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

  }

function registrerUser(user){
    return Axios.post("/users/register",user)
}


export const authServices={
    login,saveToken,decoderToken,getToken,logOut,isLoged,getUsername,getUserConnecte,registrerUser,getUserId
}