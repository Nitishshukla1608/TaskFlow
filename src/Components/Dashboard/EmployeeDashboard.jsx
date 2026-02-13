import React from 'react'
import Header from '../Headooter/Employee/Header'
import Footer from '../Headooter/Employee/Footer'

function EmployeeDashboard({children}) {
  return (
    <>
    <Header />
    <main>
    {children}
    </main>
    <Footer />
    </>
  )
}

export default EmployeeDashboard