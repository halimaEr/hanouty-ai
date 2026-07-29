import Axios from './axiosServices'


function getProduitsParUserId(id){
    return Axios.get("/produits/user/"+id);
}
function getProduitsAvecDetails(){
    return Axios.get("/produits/all/detailles");
}


function supprimerProduit(id){
    return Axios.delete("/produits/"+id);
}
function geProduitById(id){
   return Axios.get("/produits/"+id);
}
function updateProduit(id,prod){
    return Axios.put("/produits/"+id,prod);
}
function addProduit(prod){
    return Axios.post("/produits/add",prod);
}
export const produitServices={
 getProduitsParUserId,supprimerProduit,geProduitById,updateProduit,addProduit,getProduitsAvecDetails
}