"use client";

import { AuthGuard } from "@/components/auth/AuthGuards";

interface ProjectSubmissionClientWrapperProps {
  children: React.ReactNode;
}

export default function ProjectSubmissionClientWrapper({ children }: ProjectSubmissionClientWrapperProps) {
  return (
    <AuthGuard role="user">
      {children}
    </AuthGuard>
  );
}
