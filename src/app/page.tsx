import EnglishListeningApp from "@/components/english-listening-app";
import InstallPWAButton from "@/components/InstallPWAButton";

export default function Home() {
  return (
    <main>
      <InstallPWAButton />
      <EnglishListeningApp />
    </main>
  );
}
