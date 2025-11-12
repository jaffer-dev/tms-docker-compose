import { Select } from "antd"
import { useEffect, useState } from "react";
import "./CSelect.css"

const CSelect = ({ data = [],
    title,
    placeholder,
    name,
    className = "",
    label,
    value,
    error,
    onChange }) => {

    const [selectedValue, setSelectedValue] = useState(null);

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    const handleChange = (val) => {
        setSelectedValue(val);
        if (onChange) onChange(val, name);
    };

    return (
        <div className="select-dropdown-main">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                </label>
            )}
            <Select
                name={name}
                placeholder={placeholder || title}
                onChange={(val) => handleChange(val)}
                value={selectedValue}
                className="select-dropdown"
            >
                {data.map((item) => (
                    <Select.Option
                        key={item.key || item._id || item.label}
                        value={item.key || item._id || item.label}
                    >
                        <div className="icons-main">
                            <i>{item.icon}</i>
                            <span>{item.label || item.username}</span>
                        </div>
                    </Select.Option>
                ))}
            </Select>
            {error && <span className="form-error">{error}</span>}
        </div>
    )
}

export default CSelect