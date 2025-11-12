import React from "react";
import { Spin } from "antd";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="ant-loading-page">
      <Spin size="large" tip="Loading, please wait..." />
    </div>
  );
};

export default Loader;