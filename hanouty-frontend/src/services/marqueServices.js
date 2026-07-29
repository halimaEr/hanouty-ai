import Axios from './axiosServices'


function getAllMarques(){
    return Axios.get("/marques");
}

function supprimerMarque(id){
    return Axios.delete("/marques/"+id);
}
function geMarqueById(id){
   return Axios.get("/marques/"+id);
}
function updateMarque(id,marque){
    return Axios.put("/marques/"+id,marque);
}
function addMarque(marque){
    return Axios.post("/marques/add",marque);
}
export const marqueServices={
 getAllMarques,supprimerMarque,geMarqueById,updateMarque,addMarque
}