import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RolePage } from './RolePage';
import { RoleForm } from './RoleForm';
import { RoleDetail } from './RoleDetail';

export function RoleRoute() {
  return (
    <Routes>
      <Route path="/" element={<RolePage />} />
      <Route path="/new" element={<RoleForm />} />
      <Route path="/:id" element={<RoleDetail />} />
      <Route path="/:id/edit" element={<RoleForm />} />
    </Routes>
  );
}