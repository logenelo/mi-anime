import { Env } from './index';
export type Handler = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;

type method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Route = {
  path: string;
  handler: Handler;
};

export class Router {
  private routes: { [M in method]?: Route[] } = {};

  private corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  private createCorsResponse(response: Response): Response {
    const headers = new Headers(response.headers);
    Object.entries(this.corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  private _pathToRegex(path: string): RegExp {
    return new RegExp(`^${path.replace(/:[^\s/]+/g, '([^/]+)')}$`);
  }

  private _getPathParams(path: string, pathname: string): Record<string, string> {
    const params: Record<string, string> = {};
    const pathParts = path.split('/');
    const pathnameParts = pathname.split('/');

    pathParts.forEach((part, i) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = pathnameParts[i];
      }
    });

    return params;
  }

  add(method: method, path: string, handler: Handler) {
    if (!this.routes[method]) {
      this.routes[method] = [];
    }
    this.routes[method].push({ path, handler });
    return this;
  }

  get(path: string, handler: Handler) {
    return this.add('GET', path, handler);
  }

  post(path: string, handler: Handler) {
    return this.add('POST', path, handler);
  }

  put(path: string, handler: Handler) {
    return this.add('PUT', path, handler);
  }

  delete(path: string, handler: Handler) {
    return this.add('DELETE', path, handler);
  }

  async handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: this.corsHeaders
      });
    }

    const url = new URL(request.url);
    const routes = this.routes[request.method as method];
    
    if (!routes) {
      return this.createCorsResponse(
        new Response('Not found', { status: 405 })
      );
    }

    for (const route of routes) {
      if (this._pathToRegex(route.path).test(url.pathname)) {
        const params = this._getPathParams(route.path, url.pathname);
        if (Object.keys(params).length) {
          request.params = params;
        }
       
        try {
          const response = await route.handler(request, env, ctx);
          return this.createCorsResponse(response);
        } catch (error) {
          return this.createCorsResponse(
            new Response('Internal Server Error', { status: 500 })
          );
        }
      }
    }

    return this.createCorsResponse(
      new Response('Not found', { status: 404 })
    );
  }
}