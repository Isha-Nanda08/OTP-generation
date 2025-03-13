import React from 'react';
import { useDoctor } from '../context/DoctorContext';

function Navbar() {
  const { userProfile } = useDoctor();

  return (
    <nav className="bg-green-500 text-white p-4">
      <h1 className="text-lg font-bold">Doctor Portal</h1>
      {userProfile && <p>Welcome, {userProfile.name}</p>}
    </nav>
  );
}

export default Navbar;
