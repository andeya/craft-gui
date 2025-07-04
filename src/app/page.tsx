import { MyAssistant } from "@/components/MyAssistant";
import { Greet } from "@/components/Greet";

export default function Home() {
  return (
    <main className="h-dvh">
      <MyAssistant />
      <Greet className="fixed left-[20px] bottom-[100px]" />
    </main>
  );
}
