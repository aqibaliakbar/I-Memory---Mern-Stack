import React from "react";

const Alert = ({ alert }) => {
  const capitalize = (word) => {
    if (word && typeof word === "string") {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return "";
  };

  return (
    <div>
      {alert && (
        <div
          className={`bg-white text-[#6494b4] px-4 py-3 rounded relative`}
          role="alert"
        >
          <strong className="font-bold mr-1">{capitalize(alert.type)}:</strong>
          <span className="block sm:inline">{alert.msg}</span>
        </div>
      )}
    </div>
  );
};

export default Alert;
