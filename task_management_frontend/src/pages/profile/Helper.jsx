import React from 'react';
import { Descriptions, Divider } from "antd";
import { readableText, renderDate } from '../../utils/Methods';

export const renderPrimaryDetails = ( userdata ) => {
  const items = [
    { key: '1', label: 'Name', children: readableText(userdata.username || '-') },
    { key: '2', label: 'Email', children: readableText(userdata.email || '-') },
    { key: '3', label: 'Role', children: readableText(userdata.role || '-') },
    { key: '4', label: 'Designation', children: readableText(userdata.personalDetails?.designation || '-') },
    { key: '5', label: 'Department', children: readableText(userdata.department || '-') },
    { key: '6', label: 'Phone', children: readableText(userdata.personalDetails?.personalMobile || '-') },
    { key: '7', label: 'Address', children: readableText(userdata.personalDetails?.address || '-') },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <Divider orientation="left">Primary Information</Divider>
      <Descriptions
        size="medium"
        bordered
        items={items}
        column={1}
        className="custom-descriptions"
      />
    </div>
  );
};

export const renderSecondaryDetails = ( userdata ) => {
  const items = [
    { key: '1', label: 'Full Name', children: readableText(userdata.personalDetails?.fullName || '-') },
    { key: '2', label: 'Father Name', children: readableText(userdata.personalDetails?.fatherName || '-') },
    { key: '3', label: 'Gender', children: readableText(userdata.personalDetails?.gender || '-') },
    { key: '4', label: 'Marital Status', children: readableText(userdata.personalDetails?.maritalStatus || '-') },
    { key: '5', label: 'Nationality', children: readableText(userdata.personalDetails?.nationality || '-') },
    { key: '6', label: 'Personal Email', children: readableText(userdata.personalDetails?.personalEmail || '-') },
    { key: '7', label: 'Date Of Joining', children: renderDate(userdata.personalDetails?.dateOfJoining || '-') },
    { key: '8', label: 'CNIC', children: readableText(userdata.personalDetails?.cnic || '-') },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <Divider orientation="left">Secondary Information</Divider>
      <Descriptions
        size="medium"
        bordered
        items={items}
        column={1}
        className="custom-descriptions"
      />
    </div>
  );
};

export const renderContactDetails = ( userdata ) => {
  const items = [
    { key: '1', label: 'Emergency Contact No', children: readableText(userdata.personalDetails?.alternateContactNo || '-') },
    { key: '2', label: 'Emergency Contact Name', children: readableText(userdata.personalDetails?.emergencyContactName || '-') },
    { key: '3', label: 'Emergency Contact Relationship', children: readableText(userdata.personalDetails?.relationship || '-') },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <Divider orientation="left">Contact Information</Divider>
      <Descriptions
        size="medium"
        bordered
        items={items}
        column={1}
        className="custom-descriptions"
      />
    </div>
  );
};
