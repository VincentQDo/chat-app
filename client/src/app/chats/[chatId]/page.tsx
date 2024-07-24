export default function Chat({ params }: { params: { chatId: string } }) {
  return <div>{params.chatId}</div>
}
