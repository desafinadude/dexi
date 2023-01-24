import React, { Component, Suspense } from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';

import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';

import { ProjectList } from './pages/Project_List';
import { ProjectView } from './pages/Project_View';
import { DocView } from './pages/Doc_View';
import { ReferenceList } from './pages/Reference_List';
import { QuickExtract } from './pages/Quick_Extract';



export class Router extends Component {

  // This is not great. Fix with hooks.
  onLogin = () => {
    this.props.onLogin();
  }    


  render() {
    return (
      <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login onLogin={this.onLogin} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/project" element={<ProjectList />} />
          <Route path="/project/:projectId" element={<ProjectView />} />
          <Route path="/doc/:docId" element={<DocView />} />
          <Route path="/reference" element={<ReferenceList />} />
          <Route path="/quick-extract" element={<QuickExtract />} />
      </Routes>
    )
  }
}