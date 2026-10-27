import { createFileRoute, redirect } from '@tanstack/react-router';
// Former combined studio; kept so old links still work.
export const Route = createFileRoute('/_authenticated/studio')({ beforeLoad: () => { throw redirect({ to: '/traduction', replace: true }); } });
