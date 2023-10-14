// Start listening on port 8080 of localhost.
const server = Deno.listen({ port: 8080 });
console.log("File server running on http://localhost:8080/");

for await (const conn of server) {
  handleHttp(conn).catch(console.error);
}

async function handleHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    // Check if the request URL is the root
    const url = new URL(requestEvent.request.url);
    let filepath = ".";
    if (url.pathname === "/" || url.pathname === "/index.html") {
      filepath += "/index.html";
    } else {
      filepath += decodeURIComponent(url.pathname);
    }

    // Try opening the file
    let file;
    try {
      file = await Deno.open(filepath, { read: true });
    } catch {
      // If the file cannot be opened, return a "404 Not Found" response
      const notFoundResponse = new Response("404 Not Found", { status: 404 });
      await requestEvent.respondWith(notFoundResponse);
      continue;
    }

    // Build a readable stream so the file doesn't have to be fully loaded into
    // memory while we send it
    const readableStream = file.readable;

    // Determine the MIME type based on the file extension
    const responseHeaders = new Headers();
    const extension = filepath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
        responseHeaders.set('Content-Type', 'application/javascript');
        break;
      case 'html':
        responseHeaders.set('Content-Type', 'text/html');
        break;
      case 'wasm':
        responseHeaders.set('Content-Type', 'application/wasm');
        break;
      // ... add cases for other file types as needed
    }

    // Build and send the response
    const response = new Response(readableStream, { headers: responseHeaders });
    await requestEvent.respondWith(response);
  }
}
