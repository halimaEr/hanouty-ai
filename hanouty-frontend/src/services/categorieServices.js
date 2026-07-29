import Axios from './axiosServices'


function getAllCategories(){
    return Axios.get("/categories");
}

function supprimerCategorie(id){
    return Axios.delete("/categories/"+id);
}
function geCategorieById(id){
   return Axios.get("/categories/"+id);
}
function updateCategorie(id,cat){
    return Axios.put("/categories/"+id,cat);
}
function addCategorie(cat){
    return Axios.post("/categories/add",cat);
}
export const categorieServices={
 getAllCategories,supprimerCategorie,geCategorieById,updateCategorie,addCategorie
}