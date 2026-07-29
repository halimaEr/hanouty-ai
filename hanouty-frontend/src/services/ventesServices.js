import Axios from './axiosServices'


function getVentesParUserId(id){
    return Axios.get("/ventes/user/"+id);
}


function supprimerVente(id){
    return Axios.delete("/ventes/"+id);
}
function geVenteById(id){
   return Axios.get("/ventes/"+id);
}
function updateVente(id,prod){
    return Axios.put("/ventes/"+id,prod);
}

export const ventesServices={
    getVentesParUserId,geVenteById,updateVente,supprimerVente
}