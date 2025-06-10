import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; 
import { routes } from "./routes";
import "./index.css";
import { QueryProvider } from "./services/react-query/queryProvider.jsx";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";


const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryProvider> 
         <RouterProvider router={router} />


      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover={false}
        theme="colored"
      />

</QueryProvider>
  </StrictMode>
);
