#!/usr/bin/env python

import asyncio
import http
import signal
import websockets

PORT = 8080

clients = set()


async def handler(websocket: websockets.WebSocketServerProtocol):
    websockets.broadcast(clients, f"{websocket.id} connected")
    clients.add(websocket)

    try:
        while True:
            message = await websocket.recv()
            websockets.broadcast(clients, message)
    finally:
        # Remove client from the connection pool when they disconnect
        clients.remove(websocket)
        websockets.broadcast(clients, f"{websocket.id} disconnected")


async def health_check(path, request_headers):
    print(request_headers)
    if path == "/health":
        return http.HTTPStatus.OK, [], b"OK\n"


async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)
    async with websockets.serve(
        handler, host="", port=PORT, process_request=health_check
    ):
        print(f"Webosocket server started at {PORT}")
        await stop


if __name__ == "__main__":
    asyncio.run(main())
