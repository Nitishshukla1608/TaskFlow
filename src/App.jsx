import { useEffect, useState } from 'react';
import './App.css';
import { useSelector } from 'react-redux';
import { employeeData as EMPLOYEE_SEED, adminData as ADMIN_SEED } from './Utils/LocalStorage';
import DashboardWrapper from './Components/Dashboard/DashboardWrapper';

function App() {
  const [employeeData, setEmployeeData] = useState([]);
  const [adminData, setAdminData] = useState([]);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // DEV ONLY: reset storage
    localStorage.clear();

    localStorage.setItem("employees", JSON.stringify(EMPLOYEE_SEED));
    localStorage.setItem("admins", JSON.stringify(ADMIN_SEED));

    // ✅ sync state with storage
    setEmployeeData(EMPLOYEE_SEED);
    setAdminData(ADMIN_SEED);

    console.log(JSON.parse(localStorage.getItem("admins")));
  
  }, []);

  return (
    <DashboardWrapper
      employeeData={employeeData}
      adminData={adminData}
    />
  );
}

export default App;
