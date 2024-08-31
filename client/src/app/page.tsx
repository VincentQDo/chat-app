import Link from "next/link";

export default function Home() {
  return (
    <main>
      <ul>
        <li>
          <Link href="/globalchat">Go to Chat</Link>
        </li>
      </ul>
    </main>
  );
}
