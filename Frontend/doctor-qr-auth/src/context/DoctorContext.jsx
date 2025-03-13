import React, { createContext, useContext, useState } from 'react';

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  return (
    <DoctorContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => useContext(DoctorContext);
