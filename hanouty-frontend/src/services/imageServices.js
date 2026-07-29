import Axios from './axiosServices'


function getNewImages(){
    return Axios.get("/images/status/new");
}

function supprimerImage(id){
    return Axios.delete("/images/"+id);
}

function lierImageAuProduit(idImage, idProduit) {
    return Axios.put("/images/" + idImage + "/lier/" + idProduit);
}

export const imageServices={
    getNewImages,supprimerImage,lierImageAuProduit
}