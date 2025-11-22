import React from "react";
import ContactCard from "../sub/ContactCard";

const Contact = () => {
  return (
    <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center">
      <div className="h-[60%] w-[50%] relative bg-cover bg-center rounded-lg">
        <div className="absolute inset-x-0 bottom-16 w-[70%] md:w-[60%] mx-auto">
          <ContactCard />
        </div>
      </div>
    </div>
  );
};
export default Contact;
