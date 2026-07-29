import Axios from './axiosServices'


function getComptes(){
    return Axios.get("/users/pending/get");
}

function supprimerCompte(id){
    return Axios.delete("/users/pending/"+id);
}
function accepterCompte(id){
   return Axios.post("/users/pending/approve/"+id);
}


function getClients(){
    return Axios.get("/users/");
}
function supprimerClient(id){
    return Axios.delete("/users/"+id);
}

export const userServices={
    getComptes,supprimerCompte,accepterCompte,getClients,supprimerClient
}