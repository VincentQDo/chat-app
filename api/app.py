import asyncio
import websockets

URL = "localhost"
PORT = 8765

allConnectedClients = set()


async def hello(websocket):
    await sendMessageToAllClients(f"###CONNECTED### {websocket} connected")
    allConnectedClients.add(websocket)

    try:
        while True:
            message = await websocket.recv()
            await sendMessageToAllClients(message)
    except websockets.exceptions.ConnectionClosedError:
        print(f"Client {websocket} disconnected")
        pass
    finally:
        # Remove client from the connection pool when they disconnect
        allConnectedClients.remove(websocket)
        await sendMessageToAllClients(f"{websocket} disconnected")


async def sendMessageToAllClients(message):
    print(f">>> To All: {message}")
    for client in allConnectedClients:
        await client.send(message)


async def main():
    async with websockets.serve(hello, URL, PORT):
        print(f"Webosocket server started at {URL}:{PORT}")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
