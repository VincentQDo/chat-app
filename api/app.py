import asyncio
import websockets

URL = "localhost"
PORT = 8765

clients = set()


async def handler(websocket):
    await sendMessageToAllClients(f"###CONNECTED### {websocket} connected")
    clients.add(websocket)

    try:
        while True:
            message = await websocket.recv()
            await sendMessageToAllClients(message)
    finally:
        # Remove client from the connection pool when they disconnect
        clients.remove(websocket)
        await sendMessageToAllClients(f"{websocket} disconnected")


async def sendMessageToAllClients(message):
    print(f">>> To All: {message}")
    websockets.broadcast(clients, message)


async def main():
    async with websockets.serve(handler, URL, PORT):
        print(f"Webosocket server started at {URL}:{PORT}")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
