import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('health/db', 'routes/health.db.tsx'),
  route('api/auth/*', 'routes/api.auth.$.tsx'),
  route('auth/login', 'routes/auth.login.tsx'),
  route('work-orders/new', 'routes/work-orders.new.tsx'),
  route('work-orders/:id/edit', 'routes/work-orders.$id.edit.tsx'),
  route('work-orders/:id', 'routes/work-orders.$id.tsx'),
  route('users', 'routes/users.tsx'),
] satisfies RouteConfig
