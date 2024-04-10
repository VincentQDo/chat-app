import asyncio
import websockets

URL = "localhost"
PORT = 8765

allConnectedClients = set()


async def hello(websocket):
    allConnectedClients.add(websocket)
    try:
        while True:
            message = await websocket.recv()
            print(allConnectedClients.__len__())
            print(f"<<< {message}")

            for client in allConnectedClients:
                print(f">>> {message}")
                print(client)
                await client.send(message)
    except websockets.exceptions.ConnectionClosedError:
        pass
    finally:
        # Remove client from the connection pool when they disconnect
        allConnectedClients.remove(websocket)


async def main():
    async with websockets.serve(hello, URL, PORT):
        print(f"Webosocket server started at {URL}:{PORT}")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
