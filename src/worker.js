import indexTemplate from './templates/index.html';

function getTodayEAT() {
  const now = new Date();
  const eat = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
  const y = eat.getFullYear();
  const m = String(eat.getMonth() + 1).padStart(2, '0');
  const d = String(eat.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Login API endpoint
    if (path === '/api/login' && request.method === 'POST') {
      try {
        const { email, password } = await request.json();

        if (!email || !password) {
          return Response.json({ success: false, message: 'Email and password are required' }, { status: 400 });
        }

        const user = await env.DB.prepare(
          'SELECT email, password_hash, name FROM users WHERE email = ?'
        ).bind(email.toLowerCase().trim()).first();

        if (!user) {
          return Response.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }

        const inputHash = await hashPassword(password);

        if (inputHash !== user.password_hash) {
          return Response.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }

        return Response.json({ success: true, user: { email: user.email, name: user.name } });
      } catch (err) {
        return Response.json({ success: false, message: 'Server error' }, { status: 500 });
      }
    }

    // Serve dashboard with D1 data injected
    if (path === '/' || path === '/index.html' || path === '/index') {
      try {
        const { results } = await env.DB.prepare(
          'SELECT order_id, review_date, review_time, restaurant, country, city, customer_name, rating, comment FROM reviews ORDER BY review_date DESC, review_time DESC'
        ).all();

        const data = results.map(r => ({
          d: r.review_date,
          t: r.review_time,
          o: r.order_id,
          rs: r.restaurant,
          co: r.country,
          ci: r.city,
          n: r.customer_name,
          rt: r.rating,
          cm: r.comment
        }));

        let html = indexTemplate;
        html = html.replace('__REVIEWS_DATA__', JSON.stringify(data));
        html = html.replace('__TODAY_DATE__', getTodayEAT());

        return new Response(html, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      } catch (err) {
        return new Response('Database error: ' + err.message, { status: 500 });
      }
    }

    // All other paths (signin.html, images, etc.) served by assets binding
    return env.ASSETS.fetch(request);
  }
};
