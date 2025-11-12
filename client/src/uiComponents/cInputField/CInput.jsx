import React from "react";
import "./CInput.css";

const CInput = ({
  placeHolder = "",
  name,
  label,
  type = "text",
  value = "",
  className = "",
  error,
  onChange = () => null,
  onBlur = () => null,
  disabled = false,
  min,
  max,
}) => {
  return (
    <div className={`cinput-container ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
        </label>
      )}

      {type === "date" ? (
        <input
          id={name}
          name={name}
          type="date"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          min={min}
          max={max}
          className={`cinput-field ${error ? "cinput-error-border" : ""}`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeHolder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`cinput-field ${error ? "cinput-error-border" : ""}`}
        />
      )}

      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export default CInput;
