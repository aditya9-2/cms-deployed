/* eslint-disable react/prop-types */
const Button = ({ type, label, onClick, width = "w-auto" }) => {
  return (
    <div
      onClick={onClick}
      className={`px-6 py-1 md:py-2 rounded cursor-pointer hover:opacity-90 text-center
        ${width}
         ${
           type === "border-btn" ? "border border-white text-white" : "bg-white"
         }`}
    >
      {label}
    </div>
  );
};

export default Button;
