import Link from "next/link";

export default function Home() {
  return (
    <main>
      <ul>
        <li>
          <Link href="/chats">Go to Chat</Link>
        </li>
        <li>
          <Link href="/profile">Go to Profile</Link>
        </li>
        <li>
          <Link href="/settings">Go to Settings</Link>
        </li>
        <li>
          <Link href="/createchat">New Chat</Link>
        </li>
      </ul>
    </main>
  );
}
