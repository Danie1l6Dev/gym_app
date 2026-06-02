import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants';

export default function AdminIndex() {
  return <Redirect href={ROUTES.app.adminDashboard as never} />;
}
