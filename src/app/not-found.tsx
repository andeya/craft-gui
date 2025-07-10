import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center py-12 px-6 shadow-lg">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! The page you are looking for does not exist.
        </p>
        <Button asChild variant="outline" className="px-8 py-2 text-base">
          <Link href="/">Back to Home</Link>
        </Button>
      </Card>
    </div>
  );
}
