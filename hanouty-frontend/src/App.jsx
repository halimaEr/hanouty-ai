import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout    from "./components/AdminLayout";
import UserLayout    from "./components/UserLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login          from "./auth/Login";

import AdminDash      from "./dashbord/AdminDash";
import UserDash       from "./dashbord/UserDash";
import CompteList     from "./admin/users/CompteList";
import ListClients    from "./admin/users/ListeClients";
import Listemarque    from "./admin/marque/Listemarque";
import Addmarque      from "./admin/marque/Addmarque";
import Editmarque     from "./admin/marque/Editmarque";
import ListCategorie  from "./admin/categorie/ListCategorie";
import AddCategorie   from "./admin/categorie/AddCategorie";
import EditCategorie  from "./admin/categorie/EditProduit";
import ListeProduits  from "./admin/produit/ListeProduits";
import AddProduit     from "./admin/produit/AddProduit";
import EditProduit    from "./admin/produit/EditProduit";
import NewImages      from "./admin/newimg/NewImages";
import Detectioncamera from "./user/Detectioncamera";
import { DetectionProvider }  from "./user/Detectioncontext"; // ← fichier fourni
import Vente from "./user/Vente";
import ListeVentes from "./user/gererVentes/ListVentes";


export default function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />


        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dash"              element={<AdminDash />} />
          <Route path="comptes"           element={<CompteList />} />
          <Route path="clients"           element={<ListClients />} />
          <Route path="marques"           element={<Listemarque />} />
          <Route path="marques/add"       element={<Addmarque />} />
          <Route path="marques/edit/:id"  element={<Editmarque />} />
          <Route path="categories"        element={<ListCategorie />} />
          <Route path="categories/add"    element={<AddCategorie />} />
          <Route path="categories/edit/:id" element={<EditCategorie />} />
          <Route path="produits"          element={<ListeProduits />} />
          <Route path="produits/add"      element={<AddProduit />} />
          <Route path="produits/edit/:id" element={<EditProduit />} />
          <Route path="images/new"        element={<NewImages />} />
        </Route>



        <Route
          path="/user"
          element={
            <ProtectedRoute requiredRole="user">
              <DetectionProvider><UserLayout /></DetectionProvider>
              
            </ProtectedRoute>
          }
        >
          <Route path="dash" element={<UserDash />} />
          <Route path="camera" element={<Detectioncamera />} />
          <Route path="vente" element={<Vente />} />
          <Route path="ventes" element={<ListeVentes />} />

          

        </Route>



      </Routes>
    </Router>
  );
}