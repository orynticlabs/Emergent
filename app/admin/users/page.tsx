"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSUsersAdminPage } from "@/components/users/OryCMSUsersAdminPage";

export default function UsersPage() {
  return (
    <AppShell section="Users">
      <OryCMSUsersAdminPage />
    </AppShell>
  );
}
