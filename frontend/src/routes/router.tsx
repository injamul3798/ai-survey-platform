import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/LoginPage";
import { ParticipantsPage } from "../pages/ParticipantsPage";
import { ParticipantCreatePage } from "../pages/ParticipantCreatePage";
import { SurveyCreatePage } from "../pages/SurveyCreatePage";
import { SurveysPage } from "../pages/SurveysPage";
import { SurveySubmissionPage } from "../pages/SurveySubmissionPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/survey/submit/:token", element: <SurveySubmissionPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <Navigate to="/participants" replace /> },
          { path: "/participants", element: <ParticipantsPage /> },
          { path: "/participants/new", element: <ParticipantCreatePage /> },
          { path: "/surveys", element: <SurveysPage /> },
          { path: "/surveys/new", element: <SurveyCreatePage /> },
        ],
      },
    ],
  },
]);

