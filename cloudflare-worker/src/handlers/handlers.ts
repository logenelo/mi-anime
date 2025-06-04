export const fetchUrl =  async (request: Request, env: Env, ctx: ExecutionContext) => {
  const url = request.url;
  const params = new URL(url);
  const targetUrl = params.searchParams.get('url');
  if (!targetUrl) {
    return new Response('Invalid url', { status: 400 });
  }

  const response = await fetch(targetUrl).then(response => response.text());
  return new Response((response), {
    headers: { 'Content-Type': 'application/json' }
  });;
};