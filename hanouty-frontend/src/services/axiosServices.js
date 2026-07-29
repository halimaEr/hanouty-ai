import axios from "axios";
import { authServices } from "./authServices";

const Axios = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

// const Axios = axios.create({
//     baseURL: "http://192.168.1.8:8000"  // ← remplace 127.0.0.1 par ton IP
// });

Axios.interceptors.request.use(request => {
    if (authServices.isLoged()) {
        const token = authServices.getToken();
        request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
});

export default Axios;
