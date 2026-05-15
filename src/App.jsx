//import LoginPage from './pages/Auth/LoginPage';
//import NavPage from './pages/Nav/NavPage';
//import AccountPage from './pages/AccountManagement/AccountPage';
import Product from "./pages/Product/ProductPage";
import MainLayout from "./layout/MainLayout";

function App() {
  return (
    <>
      {/* <div className="min-h-screen bg-[#F8F9FA]">
        <NavPage />
      </div> */}

      {/*<div className="min-h-screen">
        <LoginPage />
      </div> */}
      {/*<div className="min-h-screen">
        <AccountPage />
      </div> */}  
      
      <MainLayout>
        <Product />
      </MainLayout>
      
    </>
  );
}

export default App;