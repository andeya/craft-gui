import { Greet } from "@/components/Greet";
import { MyAssistant } from "@/components/MyAssistant";

export default function Home() {
  return (
    <main className="h-dvh">
      <MyAssistant />
      <Greet className="fixed left-[20px] bottom-[100px]" />
    </main>
  );
}
