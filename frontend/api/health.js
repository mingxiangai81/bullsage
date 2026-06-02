export default function handler() {
  return Response.json({ status: 'ok', version: '2.0.0', runtime: 'vercel-edge' });
}
